defmodule MoviesGoogle.AI do
  @model "text-embedding-3-small"
  @dimensions 512

  def embed(texts) when is_list(texts) do
    case System.fetch_env("OPENAI_API_KEY") do
      :error ->
        {:error, "OPENAI_API_KEY not set"}

      {:ok, api_key} ->
        response =
          Req.post!(
            "https://api.openai.com/v1/embeddings",
            json: %{model: @model, input: texts, dimensions: @dimensions},
            headers: [{"authorization", "Bearer #{api_key}"}],
            receive_timeout: 60_000
          )

        case response.body do
          %{"data" => data} ->
            {:ok, Enum.map(data, & &1["embedding"])}

          %{"error" => %{"message" => msg}} ->
            {:error, msg}
        end
    end
  end

  def embed(text) when is_binary(text) do
    case embed([text]) do
      {:ok, [vector]} -> {:ok, vector}
      error -> error
    end
  end

  def encode(vector) when is_list(vector) do
    :erlang.term_to_binary(vector)
  end

  def decode(binary) when is_binary(binary) do
    :erlang.binary_to_term(binary, [:safe])
  end

  def cosine_similarity(a, b) do
    dot = Enum.zip(a, b) |> Enum.reduce(0.0, fn {x, y}, acc -> acc + x * y end)
    norm_a = :math.sqrt(Enum.reduce(a, 0.0, fn x, acc -> acc + x * x end))
    norm_b = :math.sqrt(Enum.reduce(b, 0.0, fn x, acc -> acc + x * x end))

    if norm_a == 0.0 or norm_b == 0.0, do: 0.0, else: dot / (norm_a * norm_b)
  end
end
