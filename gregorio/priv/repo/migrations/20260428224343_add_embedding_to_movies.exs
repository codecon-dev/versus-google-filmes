defmodule MoviesGoogle.Repo.Migrations.AddEmbeddingToMovies do
  use Ecto.Migration

  def change do
    alter table(:movies) do
      add :embedding, :binary
    end
  end
end
