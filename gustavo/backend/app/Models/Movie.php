<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    protected $keyType = 'int';
    public $incrementing = false;
    protected $guarded = [];

    protected $casts = [
        'genres' => 'array',
        'keywords' => 'array',
        'cast_members' => 'array',
        'release_date' => 'date',
        'popularity' => 'float',
        'vote_average' => 'float',
    ];
}
