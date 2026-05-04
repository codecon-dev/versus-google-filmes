defmodule MoviesGoogleWeb.PageController do
  use MoviesGoogleWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
