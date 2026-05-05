<?php

namespace App\Http\Controllers;

use App\Services\Movies\MovieSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovieSearchController extends Controller
{
    public function __invoke(Request $request, MovieSearchService $service): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:200',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $query = trim(preg_replace('/\s+/', ' ', str_replace('+', ' ', $validated['q'])));

        $results = $service->search(
            query: $query,
            limit: $validated['limit'] ?? 12,
        );

        return response()->json([
            'query' => $query,
            'count' => count($results),
            'data' => $results,
        ]);
    }
}
