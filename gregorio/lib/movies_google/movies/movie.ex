defmodule MoviesGoogle.Movies.Movie do
  use Ecto.Schema
  import Ecto.Changeset

  schema "movies" do
    field :tmdb_id, :integer
    field :title, :string
    field :original_title, :string
    field :overview, :string
    field :tagline, :string
    field :genres, :string
    field :release_date, :date
    field :runtime, :integer
    field :vote_average, :float
    field :vote_count, :integer
    field :popularity, :float
    field :budget, :integer
    field :revenue, :integer
    field :original_language, :string
    field :director, :string
    field :cast_names, :string
    field :embedding, :binary

    timestamps()
  end

  def changeset(movie, attrs) do
    movie
    |> cast(attrs, [
      :tmdb_id, :title, :original_title, :overview, :tagline,
      :genres, :release_date, :runtime, :vote_average, :vote_count,
      :popularity, :budget, :revenue, :original_language,
      :director, :cast_names
    ])
    |> validate_required([:tmdb_id, :title])
    |> unique_constraint(:tmdb_id)
  end
end
