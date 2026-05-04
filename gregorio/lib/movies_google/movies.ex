defmodule MoviesGoogle.Movies do
  import Ecto.Query
  alias MoviesGoogle.{Repo, AI, EmbeddingStore}
  alias MoviesGoogle.Movies.Movie

  def semantic_search(query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 20)

    with {:ok, vector} <- AI.embed(query) do
      id_scores = EmbeddingStore.search(vector, limit)
      ids = Enum.map(id_scores, &elem(&1, 0))
      score_map = Map.new(id_scores)

      movies =
        from(m in Movie, where: m.id in ^ids)
        |> Repo.all()
        |> Enum.sort_by(&Map.get(score_map, &1.id, 0), :desc)

      {:ok, movies}
    end
  end

  def search(query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 20)
    offset = Keyword.get(opts, :offset, 0)

    base_query()
    |> filter_by_query(query)
    |> order_by([m], desc: m.popularity)
    |> limit(^limit)
    |> offset(^offset)
    |> Repo.all()
  end

  def count(query) do
    base_query()
    |> filter_by_query(query)
    |> Repo.aggregate(:count, :id)
  end

  def get_movie!(id), do: Repo.get!(Movie, id)

  def movies_by_actor(name) do
    term = "%#{name}%"

    from(m in Movie,
      where: like(fragment("lower(?)", m.cast_names), ^String.downcase(term)),
      order_by: [desc: m.popularity]
    )
    |> Repo.all()
  end

  def shit_index(movies) do
    scored =
      movies
      |> Enum.filter(& &1.vote_average && &1.vote_count && &1.vote_count > 0)
      |> Enum.map(fn m ->
        weight = :math.log(m.vote_count + 1)
        score = (10 - m.vote_average) * weight
        {score, weight}
      end)

    case scored do
      [] -> nil
      _ ->
        total_weight = Enum.reduce(scored, 0.0, fn {_, w}, acc -> acc + w end)
        total_score = Enum.reduce(scored, 0.0, fn {s, _}, acc -> acc + s end)
        Float.round(total_score / total_weight, 2)
    end
  end

  def random_movie do
    from(m in Movie, order_by: fragment("RANDOM()"), limit: 1)
    |> Repo.one()
  end

  def genres do
    Movie
    |> select([m], m.genres)
    |> where([m], not is_nil(m.genres))
    |> Repo.all()
    |> Enum.flat_map(&String.split(&1, ", "))
    |> Enum.uniq()
    |> Enum.sort()
  end

  defp base_query do
    from m in Movie
  end

  defp filter_by_query(q, nil), do: q
  defp filter_by_query(q, ""), do: q

  defp filter_by_query(q, search) do
    term = "%#{String.downcase(search)}%"

    where(q, [m],
      like(fragment("lower(?)", m.title), ^term) or
      like(fragment("lower(?)", m.overview), ^term) or
      like(fragment("lower(?)", m.director), ^term) or
      like(fragment("lower(?)", m.cast_names), ^term) or
      like(fragment("lower(?)", m.genres), ^term)
    )
  end
end
