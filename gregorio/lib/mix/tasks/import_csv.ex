defmodule Mix.Tasks.ImportCsv do
  use Mix.Task

  @shortdoc "Import TMDB CSV files into the database"

  def run(_args) do
    Mix.Task.run("app.start")

    movies_path = "tmdb_5000_movies.csv"
    credits_path = "tmdb_5000_credits.csv"

    IO.puts("Loading credits...")
    credits = load_credits(credits_path)

    IO.puts("Importing movies...")
    import_movies(movies_path, credits)

    IO.puts("Done!")
  end

  defp load_credits(path) do
    path
    |> File.stream!()
    |> CSV.decode!(headers: true)
    |> Enum.reduce(%{}, fn row, acc ->
      movie_id = row["movie_id"]
      director = extract_director(row["crew"])
      cast = extract_cast(row["cast"], 5)
      Map.put(acc, movie_id, %{director: director, cast_names: cast})
    end)
  end

  defp import_movies(path, credits) do
    path
    |> File.stream!()
    |> CSV.decode!(headers: true)
    |> Enum.each(fn row ->
      credit = Map.get(credits, row["id"], %{})

      attrs = %{
        tmdb_id: parse_int(row["id"]),
        title: row["title"],
        original_title: row["original_title"],
        overview: row["overview"],
        tagline: row["tagline"],
        genres: parse_names(row["genres"]),
        release_date: parse_date(row["release_date"]),
        runtime: parse_int(row["runtime"]),
        vote_average: parse_float(row["vote_average"]),
        vote_count: parse_int(row["vote_count"]),
        popularity: parse_float(row["popularity"]),
        budget: parse_int(row["budget"]),
        revenue: parse_int(row["revenue"]),
        original_language: row["original_language"],
        director: Map.get(credit, :director),
        cast_names: Map.get(credit, :cast_names)
      }

      %MoviesGoogle.Movies.Movie{}
      |> MoviesGoogle.Movies.Movie.changeset(attrs)
      |> MoviesGoogle.Repo.insert!(on_conflict: :nothing, conflict_target: :tmdb_id)
    end)
  end

  defp extract_director(json) do
    json
    |> parse_json()
    |> Enum.find(%{}, fn p -> p["job"] == "Director" end)
    |> Map.get("name")
  end

  defp extract_cast(json, limit) do
    json
    |> parse_json()
    |> Enum.take(limit)
    |> Enum.map(& &1["name"])
    |> Enum.join(", ")
  end

  defp parse_names(json) do
    json
    |> parse_json()
    |> Enum.map(& &1["name"])
    |> Enum.join(", ")
  end

  defp parse_json(nil), do: []
  defp parse_json(""), do: []

  defp parse_json(str) do
    case Jason.decode(str) do
      {:ok, list} when is_list(list) -> list
      _ -> []
    end
  end

  defp parse_int(nil), do: nil
  defp parse_int(""), do: nil
  defp parse_int(v) do
    case Integer.parse(v) do
      {n, _} -> n
      :error -> nil
    end
  end

  defp parse_float(nil), do: nil
  defp parse_float(""), do: nil
  defp parse_float(v) do
    case Float.parse(v) do
      {n, _} -> n
      :error -> nil
    end
  end

  defp parse_date(nil), do: nil
  defp parse_date(""), do: nil
  defp parse_date(v) do
    case Date.from_iso8601(v) do
      {:ok, d} -> d
      _ -> nil
    end
  end
end
