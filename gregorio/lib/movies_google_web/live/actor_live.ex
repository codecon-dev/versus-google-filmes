defmodule MoviesGoogleWeb.ActorLive do
  use MoviesGoogleWeb, :live_view
  alias MoviesGoogle.Movies

  def mount(%{"name" => name}, _session, socket) do
    name = URI.decode(name)
    movies = Movies.movies_by_actor(name)
    shit_index = Movies.shit_index(movies)

    {:ok,
     socket
     |> assign(:actor_name, name)
     |> assign(:movies, movies)
     |> assign(:shit_index, shit_index)}
  end

  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-white">
      <div class="flex items-center gap-4 px-6 py-3 border-b border-gray-200">
        <a href="/" class="text-3xl font-normal tracking-tight select-none shrink-0" style="font-family: 'Product Sans', Arial, sans-serif;">
          <span style="color:#4285F4">M</span><span style="color:#DB4437">o</span><span style="color:#F4B400">o</span><span style="color:#4285F4">v</span><span style="color:#0F9D58">l</span><span style="color:#DB4437">l</span><span style="color:#F4B400">e</span>
        </a>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-10">
        <div class="flex items-start gap-5 mb-8">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#4285F4] to-[#0F9D58] flex items-center justify-center text-white text-3xl font-medium select-none shadow shrink-0">
            {String.first(@actor_name)}
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-normal text-[#202124]">{@actor_name}</h1>
            <p class="text-[#70757a] mt-1">
              {length(@movies)} {if length(@movies) == 1, do: "movie", else: "movies"} in database
            </p>

            <%= if @shit_index do %>
              <.shit_meter index={@shit_index} />
            <% end %>
          </div>
        </div>

        <div class="divider"></div>

        <%= if @movies == [] do %>
          <p class="text-[#70757a]">No movies found for this actor.</p>
        <% else %>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <%= for movie <- @movies do %>
              <.movie_card movie={movie} actor={@actor_name} />
            <% end %>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  defp movie_card(assigns) do
    ~H"""
    <a href={"/movies/#{@movie.id}"} class="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-gray-300 group">
      <div class="flex gap-3">
        <div class="shrink-0 w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
          🎬
        </div>
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="text-[#1a0dab] font-normal group-hover:underline leading-tight truncate">
            {@movie.title}
          </h3>
          <div class="flex items-center gap-2 text-xs text-[#70757a] flex-wrap">
            <%= if @movie.release_date do %>
              <span>{@movie.release_date.year}</span>
            <% end %>
            <%= if @movie.vote_average do %>
              <span>·</span>
              <span class="flex items-center gap-0.5">
                <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1.0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1.0 00.951-.69l1.07-3.292z"/>
                </svg>
                {Float.round(@movie.vote_average, 1)}
              </span>
            <% end %>
          </div>
          <%= if @movie.director do %>
            <p class="text-xs text-[#70757a] truncate">dir. {@movie.director}</p>
          <% end %>
          <% position = cast_position(@movie.cast_names, @actor) %>
          <%= if position do %>
            <span class="text-xs text-[#0F9D58] mt-0.5">{position}</span>
          <% end %>
        </div>
      </div>
    </a>
    """
  end

  defp shit_meter(assigns) do
    ~H"""
    <div class="mt-3 flex flex-col gap-1.5 max-w-xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-[#70757a] uppercase tracking-wide">Shit Index</span>
        <div class="flex items-center gap-1.5">
          <span class="text-lg font-semibold" style={"color: #{shit_color(@index)}"}>{@index}/10</span>
          <span class="text-lg">{shit_emoji(@index)}</span>
        </div>
      </div>
      <div class="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          style={"width: #{@index * 10}%; background: #{shit_color(@index)}"}
        ></div>
      </div>
      <p class="text-xs text-[#70757a]">{shit_label(@index)}</p>
    </div>
    """
  end

  defp shit_color(index) when index >= 8.0, do: "#8B0000"
  defp shit_color(index) when index >= 6.5, do: "#CC4400"
  defp shit_color(index) when index >= 5.0, do: "#E6840A"
  defp shit_color(index) when index >= 3.5, do: "#E6C20A"
  defp shit_color(_), do: "#0F9D58"

  defp shit_emoji(index) when index >= 8.0, do: "💩💩💩"
  defp shit_emoji(index) when index >= 6.5, do: "💩💩"
  defp shit_emoji(index) when index >= 5.0, do: "💩"
  defp shit_emoji(index) when index >= 3.5, do: "😐"
  defp shit_emoji(_), do: "🌟"

  defp shit_label(index) when index >= 8.0, do: "Cinematic catastrophe. Avoid at all costs."
  defp shit_label(index) when index >= 6.5, do: "Consistently poor choices in scripts."
  defp shit_label(index) when index >= 5.0, do: "More misses than hits."
  defp shit_label(index) when index >= 3.5, do: "Decent track record, some duds."
  defp shit_label(_), do: "Solid filmography. Good taste in projects."

  defp cast_position(nil, _), do: nil
  defp cast_position(cast_names, actor_name) do
    names = String.split(cast_names, ", ")
    idx = Enum.find_index(names, &(String.downcase(&1) == String.downcase(actor_name)))

    case idx do
      0 -> "Lead role"
      1 -> "2nd billing"
      2 -> "3rd billing"
      n when not is_nil(n) -> "#{n + 1}th billing"
      nil -> nil
    end
  end
end
