defmodule Mix.Tasks.GenEmbeddings do
  use Mix.Task
  require Logger

  @shortdoc "Generate OpenAI embeddings for all movies"
  @batch_size 100

  def run(_args) do
    Mix.Task.run("app.start")
    import Ecto.Query
    alias MoviesGoogle.{Repo, AI}
    alias MoviesGoogle.Movies.Movie

    movies =
      from(m in Movie,
        where: is_nil(m.embedding),
        select: {m.id, m.title, m.overview}
      )
      |> Repo.all()

    total = length(movies)
    IO.puts("Generating embeddings for #{total} movies in batches of #{@batch_size}...")

    movies
    |> Enum.chunk_every(@batch_size)
    |> Enum.with_index(1)
    |> Enum.each(fn {batch, i} ->
      texts = Enum.map(batch, fn {_, title, overview} ->
        "#{title}. #{overview || ""}"
      end)

      case AI.embed(texts) do
        {:ok, vectors} ->
          Enum.zip(batch, vectors)
          |> Enum.each(fn {{id, _, _}, vector} ->
            from(m in Movie, where: m.id == ^id)
            |> Repo.update_all(set: [embedding: AI.encode(vector)])
          end)

          IO.puts("Batch #{i}/#{ceil(total / @batch_size)} done")

        {:error, msg} ->
          IO.puts("Error on batch #{i}: #{msg}")
      end
    end)

    IO.puts("Done! #{total} embeddings generated.")
  end
end
