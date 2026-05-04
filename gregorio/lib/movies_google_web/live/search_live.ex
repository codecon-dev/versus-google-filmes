defmodule MoviesGoogleWeb.SearchLive do
  use MoviesGoogleWeb, :live_view
  alias MoviesGoogle.Movies

  @per_page 10

  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:query, "")
     |> assign(:results, [])
     |> assign(:total, 0)
     |> assign(:page, 1)
     |> assign(:loading, false)
     |> assign(:mode, :text)
     |> assign(:error, nil)}
  end

  def handle_event("search", %{"q" => query, "lucky" => _}, socket) do
    query = String.trim(query)

    movie =
      if query == "" do
        Movies.random_movie()
      else
        Movies.search(query, limit: 1) |> List.first() || Movies.random_movie()
      end

    {:noreply, push_navigate(socket, to: "/movies/#{movie.id}")}
  end

  def handle_event("search", %{"q" => query}, socket) do
    query = String.trim(query)
    do_search(socket, query, socket.assigns.mode)
  end

  def handle_event("toggle_mode", _, socket) do
    new_mode = if socket.assigns.mode == :text, do: :semantic, else: :text
    socket = assign(socket, :mode, new_mode)

    if socket.assigns.query != "" do
      do_search(socket, socket.assigns.query, new_mode)
    else
      {:noreply, socket}
    end
  end

  def handle_event("load_more", _, socket) do
    page = socket.assigns.page + 1
    offset = (page - 1) * @per_page
    more = Movies.search(socket.assigns.query, limit: @per_page, offset: offset)

    {:noreply,
     socket
     |> assign(:results, socket.assigns.results ++ more)
     |> assign(:page, page)}
  end

  defp do_search(socket, "", _mode) do
    {:noreply,
     socket
     |> assign(:query, "")
     |> assign(:results, [])
     |> assign(:total, 0)}
  end

  defp do_search(socket, query, :semantic) do
    case Movies.semantic_search(query, limit: @per_page) do
      {:ok, results} ->
        {:noreply,
         socket
         |> assign(:query, query)
         |> assign(:results, results)
         |> assign(:total, length(results))
         |> assign(:error, nil)}

      {:error, msg} ->
        {:noreply, assign(socket, :error, msg)}
    end
  end

  defp do_search(socket, query, :text) do
    results = Movies.search(query, limit: @per_page, offset: 0)
    total = Movies.count(query)

    {:noreply,
     socket
     |> assign(:query, query)
     |> assign(:results, results)
     |> assign(:total, total)
     |> assign(:page, 1)
     |> assign(:error, nil)}
  end

  def render(assigns) do
    ~H"""
    <div class={["min-h-screen bg-white flex flex-col", if(@query == "", do: "justify-center items-center", else: "")]}>
      <%= if @query == "" do %>
        <.home_page />
      <% else %>
        <.results_page query={@query} results={@results} total={@total} page={@page} mode={@mode} error={@error} />
      <% end %>
    </div>
    """
  end

  defp home_page(assigns) do
    ~H"""
    <div class="flex flex-col items-center gap-8 -mt-24">
      <.logo size="large" />

      <form phx-submit="search" class="w-[584px] max-w-[90vw]">
        <div class="flex items-center border border-gray-200 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow gap-3 focus-within:shadow-md">
          <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            name="q"
            type="text"
            autocomplete="off"
            autofocus
            class="flex-1 outline-none text-base text-gray-800 placeholder-gray-400"
            placeholder="Search movies..."
          />
        </div>
        <div class="flex justify-center gap-3 mt-6">
          <button type="submit" class="btn btn-sm bg-[#f8f9fa] border-[#f8f9fa] text-[#3c4043] hover:border-gray-300 hover:shadow-sm normal-case font-normal">
            Moovlle Search
          </button>
          <button type="submit" name="lucky" value="true" class="btn btn-sm bg-[#f8f9fa] border-[#f8f9fa] text-[#3c4043] hover:border-gray-300 hover:shadow-sm normal-case font-normal">
            I'm Feeling Lucky
          </button>
        </div>
      </form>
    </div>
    """
  end

  defp results_page(%{mode: _, error: _} = assigns) do
    ~H"""
    <div class="flex flex-col">
      <%!-- Top bar --%>
      <div class="flex items-center gap-4 px-6 py-3 border-b border-gray-200">
        <.logo size="small" />
        <form phx-submit="search" class="flex-1 max-w-[692px]">
          <div class="flex items-center border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow gap-3 focus-within:shadow-md focus-within:border-transparent">
            <input
              name="q"
              type="text"
              value={@query}
              autocomplete="off"
              autofocus
              class="flex-1 outline-none text-base text-gray-800"
            />
            <div class="w-px h-6 bg-gray-300"></div>
            <button type="submit" class="p-1">
              <svg class="w-5 h-5 text-[#4285F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <%!-- Results --%>
      <div class="px-6 pl-[168px] max-w-[800px] mt-4">
        <div class="flex items-center gap-4 mb-4">
          <p class="text-sm text-[#70757a]">
            About {@total} results
          </p>
          <button
            phx-click="toggle_mode"
            class={[
              "flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-colors",
              if(@mode == :semantic,
                do: "bg-[#e8f0fe] border-[#4285F4] text-[#4285F4]",
                else: "bg-white border-gray-300 text-[#70757a] hover:border-gray-400"
              )
            ]}
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <%= if @mode == :semantic, do: "Semantic search ON", else: "Semantic search" %>
          </button>
        </div>
        <%= if @error do %>
          <p class="text-sm text-red-500 mb-4">{@error}</p>
        <% end %>

        <div class="flex flex-col gap-7">
          <%= for movie <- @results do %>
            <.movie_card movie={movie} />
          <% end %>
        </div>

        <%= if length(@results) < @total do %>
          <div class="flex justify-center mt-8 mb-8">
            <button phx-click="load_more" class="btn btn-ghost normal-case text-[#4285F4]">
              More results
            </button>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  defp logo(%{size: "large"} = assigns) do
    ~H"""
    <div class="text-7xl font-normal tracking-tight select-none" style="font-family: 'Product Sans', Arial, sans-serif;">
      <span style="color:#4285F4">M</span><span style="color:#DB4437">o</span><span style="color:#F4B400">o</span><span style="color:#4285F4">v</span><span style="color:#0F9D58">l</span><span style="color:#DB4437">l</span><span style="color:#F4B400">e</span>
    </div>
    """
  end

  defp logo(%{size: "small"} = assigns) do
    ~H"""
    <a href="/" class="text-3xl font-normal tracking-tight select-none shrink-0" style="font-family: 'Product Sans', Arial, sans-serif;">
      <span style="color:#4285F4">M</span><span style="color:#DB4437">o</span><span style="color:#F4B400">o</span><span style="color:#4285F4">v</span><span style="color:#0F9D58">l</span><span style="color:#DB4437">l</span><span style="color:#F4B400">e</span>
    </a>
    """
  end

  defp movie_card(assigns) do
    ~H"""
    <div class="flex flex-col gap-1">
      <%!-- Breadcrumb --%>
      <div class="flex items-center gap-1 text-sm text-[#202124]">
        <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-1">
          🎬
        </div>
        <span class="text-[#202124]">moovlle.com</span>
        <span class="text-gray-400">›</span>
        <span class="text-[#202124]">{@movie.title}</span>
      </div>

      <%!-- Title --%>
      <a href={"/movies/#{@movie.id}"} class="text-xl text-[#1a0dab] hover:underline font-normal leading-tight">
        {@movie.title}
        <%= if @movie.release_date do %>
          <span class="text-base font-normal text-[#70757a]">({@movie.release_date.year})</span>
        <% end %>
      </a>

      <%!-- Meta --%>
      <div class="flex items-center gap-3 text-sm text-[#70757a]">
        <%= if @movie.director do %>
          <span>Directed by <span class="text-[#202124]">{@movie.director}</span></span>
        <% end %>
        <%= if @movie.vote_average do %>
          <span>·</span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {Float.round(@movie.vote_average / 2, 1)}/5
          </span>
        <% end %>
        <%= if @movie.runtime do %>
          <span>·</span>
          <span>{@movie.runtime}min</span>
        <% end %>
      </div>

      <%!-- Overview --%>
      <%= if @movie.overview && @movie.overview != "" do %>
        <p class="text-sm text-[#4d5156] leading-snug line-clamp-2">
          {@movie.overview}
        </p>
      <% end %>

      <%!-- Genre tags --%>
      <%= if @movie.genres && @movie.genres != "" do %>
        <div class="flex flex-wrap gap-1 mt-1">
          <%= for genre <- String.split(@movie.genres, ", ") |> Enum.take(4) do %>
            <span class="text-xs text-[#70757a] border border-gray-200 rounded-full px-2 py-0.5">{genre}</span>
          <% end %>
        </div>
      <% end %>
    </div>
    """
  end
end
