defmodule MoviesGoogleWeb.MovieLive do
  use MoviesGoogleWeb, :live_view
  alias MoviesGoogle.Movies

  def mount(%{"id" => id}, _session, socket) do
    movie = Movies.get_movie!(id)
    {:ok, assign(socket, :movie, movie)}
  end

  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-white">
      <%!-- Top bar --%>
      <div class="flex items-center gap-4 px-6 py-3 border-b border-gray-200">
        <a href="/" class="text-3xl font-normal tracking-tight select-none shrink-0" style="font-family: 'Product Sans', Arial, sans-serif;">
          <span style="color:#4285F4">M</span><span style="color:#DB4437">o</span><span style="color:#F4B400">o</span><span style="color:#4285F4">v</span><span style="color:#0F9D58">l</span><span style="color:#DB4437">l</span><span style="color:#F4B400">e</span>
        </a>
      </div>

      <%!-- Content --%>
      <div class="max-w-4xl mx-auto px-6 py-10">
        <%!-- Header --%>
        <div class="flex gap-8">
          <%!-- Poster placeholder --%>
          <div class="shrink-0 w-48 h-72 bg-gray-100 rounded-lg flex items-center justify-center text-6xl shadow-sm">
            🎬
          </div>

          <%!-- Info --%>
          <div class="flex flex-col gap-3 flex-1">
            <div>
              <h1 class="text-3xl font-normal text-[#202124]">{@movie.title}</h1>
              <%= if @movie.original_title && @movie.original_title != @movie.title do %>
                <p class="text-sm text-[#70757a] mt-0.5">{@movie.original_title}</p>
              <% end %>
            </div>

            <%= if @movie.tagline && @movie.tagline != "" do %>
              <p class="text-base italic text-[#70757a]">"{@movie.tagline}"</p>
            <% end %>

            <%!-- Badges --%>
            <div class="flex flex-wrap gap-2 items-center">
              <%= if @movie.release_date do %>
                <span class="badge badge-ghost">{@movie.release_date.year}</span>
              <% end %>
              <%= if @movie.runtime do %>
                <span class="badge badge-ghost">{@movie.runtime} min</span>
              <% end %>
              <%= if @movie.original_language do %>
                <span class="badge badge-ghost">{String.upcase(@movie.original_language)}</span>
              <% end %>
              <%= if @movie.vote_average do %>
                <span class="badge badge-warning gap-1">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {Float.round(@movie.vote_average, 1)} / 10
                </span>
              <% end %>
            </div>

            <%!-- Genres --%>
            <%= if @movie.genres && @movie.genres != "" do %>
              <div class="flex flex-wrap gap-1">
                <%= for genre <- String.split(@movie.genres, ", ") do %>
                  <span class="text-xs border border-[#4285F4] text-[#4285F4] rounded-full px-3 py-0.5">{genre}</span>
                <% end %>
              </div>
            <% end %>

            <%!-- Director --%>
            <%= if @movie.director do %>
              <p class="text-sm text-[#202124]">
                <span class="text-[#70757a]">Directed by</span> <span class="font-medium">{@movie.director}</span>
              </p>
            <% end %>
          </div>
        </div>

        <div class="divider"></div>

        <%!-- Overview --%>
        <%= if @movie.overview && @movie.overview != "" do %>
          <div class="mb-8">
            <h2 class="text-lg font-medium text-[#202124] mb-2">Overview</h2>
            <p class="text-[#4d5156] leading-relaxed">{@movie.overview}</p>
          </div>
        <% end %>

        <%!-- Cast --%>
        <%= if @movie.cast_names && @movie.cast_names != "" do %>
          <div class="mb-8">
            <h2 class="text-lg font-medium text-[#202124] mb-3">Cast</h2>
            <div class="flex flex-wrap gap-2">
              <%= for name <- String.split(@movie.cast_names, ", ") do %>
                <a href={"/actors/#{URI.encode(name)}"} class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors group">
                  <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {String.first(name)}
                  </div>
                  <span class="text-sm text-[#1a0dab] group-hover:underline">{name}</span>
                </a>
              <% end %>
            </div>
          </div>
        <% end %>

        <%!-- Details grid --%>
        <div class="mb-8">
          <h2 class="text-lg font-medium text-[#202124] mb-3">Details</h2>
          <div class="grid grid-cols-2 gap-x-12 gap-y-3 text-sm max-w-lg">
            <%= if @movie.release_date do %>
              <span class="text-[#70757a]">Release date</span>
              <span class="text-[#202124]">{Calendar.strftime(@movie.release_date, "%B %d, %Y")}</span>
            <% end %>
            <%= if @movie.runtime do %>
              <span class="text-[#70757a]">Runtime</span>
              <span class="text-[#202124]">{@movie.runtime} minutes</span>
            <% end %>
            <%= if @movie.budget && @movie.budget > 0 do %>
              <span class="text-[#70757a]">Budget</span>
              <span class="text-[#202124]">{format_money(@movie.budget)}</span>
            <% end %>
            <%= if @movie.revenue && @movie.revenue > 0 do %>
              <span class="text-[#70757a]">Revenue</span>
              <span class="text-[#202124]">{format_money(@movie.revenue)}</span>
            <% end %>
            <%= if @movie.vote_count do %>
              <span class="text-[#70757a]">Votes</span>
              <span class="text-[#202124]">{format_number(@movie.vote_count)}</span>
            <% end %>
            <%= if @movie.popularity do %>
              <span class="text-[#70757a]">Popularity</span>
              <span class="text-[#202124]">{Float.round(@movie.popularity, 1)}</span>
            <% end %>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp format_number(n) when is_integer(n) do
    n
    |> Integer.to_string()
    |> String.reverse()
    |> String.graphemes()
    |> Enum.chunk_every(3)
    |> Enum.join(",")
    |> String.reverse()
  end

  defp format_money(amount) when amount >= 1_000_000_000 do
    "$#{Float.round(amount / 1_000_000_000, 2)}B"
  end
  defp format_money(amount) when amount >= 1_000_000 do
    "$#{Float.round(amount / 1_000_000, 1)}M"
  end
  defp format_money(amount), do: "$#{amount}"
end
