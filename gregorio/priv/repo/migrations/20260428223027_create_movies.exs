defmodule MoviesGoogle.Repo.Migrations.CreateMovies do
  use Ecto.Migration

  def change do
    create table(:movies) do
      add :tmdb_id, :integer, null: false
      add :title, :string, null: false
      add :original_title, :string
      add :overview, :text
      add :tagline, :string
      add :genres, :string
      add :release_date, :date
      add :runtime, :integer
      add :vote_average, :float
      add :vote_count, :integer
      add :popularity, :float
      add :budget, :bigint
      add :revenue, :bigint
      add :original_language, :string
      add :director, :string
      add :cast_names, :string

      timestamps()
    end

    create unique_index(:movies, [:tmdb_id])
    create index(:movies, [:title])
    create index(:movies, [:vote_average])
    create index(:movies, [:popularity])
    create index(:movies, [:release_date])
  end
end
