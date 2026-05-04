defmodule MoviesGoogle.EmbeddingStore do
  use GenServer
  require Logger
  import Ecto.Query
  alias MoviesGoogle.{Repo, AI}
  alias MoviesGoogle.Movies.Movie

  @table :movie_embeddings

  def start_link(_), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  def search(query_vector, top_n \\ 10) do
    GenServer.call(__MODULE__, {:search, query_vector, top_n}, 15_000)
  end

  def loaded? do
    GenServer.call(__MODULE__, :loaded?)
  end

  # --- Server ---

  def init(_) do
    :ets.new(@table, [:named_table, :public, read_concurrency: true])
    send(self(), :load)
    {:ok, %{loaded: false}}
  end

  def handle_info(:load, state) do
    count = load_embeddings()
    Logger.info("EmbeddingStore loaded #{count} embeddings")
    {:noreply, %{state | loaded: true}}
  end

  def handle_call(:loaded?, _from, state) do
    {:reply, state.loaded, state}
  end

  def handle_call({:search, query_vector, top_n}, _from, state) do
    results =
      :ets.tab2list(@table)
      |> Enum.map(fn {id, vector} -> {id, AI.cosine_similarity(query_vector, vector)} end)
      |> Enum.sort_by(&elem(&1, 1), :desc)
      |> Enum.take(top_n)

    {:reply, results, state}
  end

  defp load_embeddings do
    rows =
      from(m in Movie, where: not is_nil(m.embedding), select: {m.id, m.embedding})
      |> Repo.all()

    Enum.each(rows, fn {id, blob} ->
      :ets.insert(@table, {id, AI.decode(blob)})
    end)

    length(rows)
  end
end
