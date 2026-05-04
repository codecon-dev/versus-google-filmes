defmodule MoviesGoogle.Repo do
  use Ecto.Repo,
    otp_app: :movies_google,
    adapter: Ecto.Adapters.SQLite3
end
