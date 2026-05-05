<?php

namespace App\Providers;

use App\Services\Embeddings\EmbeddingService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(EmbeddingService::class, fn () => new EmbeddingService(
            config('services.openai.key'),
            config('services.openai.embedding_model'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
