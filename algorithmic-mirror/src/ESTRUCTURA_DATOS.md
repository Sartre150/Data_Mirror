# Documentación de Estructuras JSON — Spotify Account Data

> Todas las estructuras están representadas como esquemas sin valores reales.
> Tipos usados: `string`, `number`, `boolean`, `null`, `string[]`, y objetos anidados.

---

## DuoNewFamily.json

```json
{
  "address": "string"
}
```

---

## Follow.json

```json
{
  "userIsFollowing":  ["string"],
  "userIsFollowedBy": ["string"],
  "userIsBlocking":   ["string"]
}
```

---

## Identifiers.json

```json
{
  "identifierType":  "string",
  "identifierValue": "string"
}
```

---

## Identity.json

```json
{
  "displayName":    "string",
  "firstName":      "string",
  "lastName":       "string",
  "imageUrl":       "string (URL)",
  "largeImageUrl":  "string (URL)",
  "tasteMaker":     "boolean",
  "verified":       "boolean"
}
```

---

## Inferences.json

```json
{
  "inferences": ["string"]
}
```

> Array de etiquetas de intereses, demografía y segmentos publicitarios inferidos por Spotify.

---

## Marquee.json

```json
[
  {
    "artistName": "string",
    "segment":    "string"
  }
]
```

> Array de objetos. Cada objeto representa un artista y el segmento de audiencia al que pertenece el usuario respecto a ese artista.

---

## Payments.json

```json
{
  "payment_method": "string"
}
```

---

## Playlist1.json

```json
{
  "playlists": [
    {
      "name":             "string",
      "lastModifiedDate": "string (YYYY-MM-DD)",
      "description":      "string (opcional)",
      "numberOfFollowers": "number",
      "collaborators":    ["string"],
      "items": [
        {
          "track": {
            "trackName":  "string",
            "artistName": "string",
            "albumName":  "string",
            "trackUri":   "string (spotify:track:...)"
          },
          "addedDate": "string (YYYY-MM-DD)"
        }
      ]
    }
  ]
}
```

---

## PodcastInteractivityRatedShow.json

```json
{
  "ratedShows": [
    {
      "showName": "string",
      "rating":   "number",
      "ratedAt":  "string (ISO 8601)"
    }
  ]
}
```

---

## SearchQueries.json

```json
[
  {
    "platform":             "string",
    "searchTime":           "string (ISO 8601 con timezone)",
    "searchQuery":          "string",
    "searchInteractionURIs": ["string (spotify URI)"]
  }
]
```

---

## StreamingHistory_music_0.json / StreamingHistory_music_1.json

```json
[
  {
    "endTime":    "string (YYYY-MM-DD HH:MM)",
    "artistName": "string",
    "trackName":  "string",
    "msPlayed":   "number"
  }
]
```

---

## StreamingHistory_podcast_0.json

```json
[
  {
    "endTime":     "string (YYYY-MM-DD HH:MM)",
    "podcastName": "string",
    "episodeName": "string",
    "msPlayed":    "number"
  }
]
```

---

## Userdata.json

```json
{
  "username":              "string",
  "email":                 "string",
  "country":               "string (ISO 3166-1 alpha-2)",
  "createdFromFacebook":   "boolean",
  "facebookUid":           "string",
  "birthdate":             "string (YYYY-MM-DD)",
  "gender":                "string",
  "postalCode":            "string | null",
  "mobileNumber":          "string | null",
  "mobileOperator":        "string | null",
  "mobileBrand":           "string | null",
  "creationTime":          "string (YYYY-MM-DD)",
  "assuredEstimatedAge":   "any | null",
  "assuredAgeMethod":      "any | null",
  "assuredAgeTimestamp":   "any | null"
}
```

---

## Wrapped2025.json

```json
{
  "topArtists": {
    "topArtistUris":      ["string (spotify:artist:...)"],
    "numUniqueArtists":   "number",
    "topNPercentileFan":  "number",
    "topArtistMsPlayed":  "number"
  },
  "topPodcasts": {
    "topPodcastsUri":            ["string (spotify:show:...)"],
    "topPodcastMilliseconds":    "number",
    "topPodcastPercentage":      "number",
    "totalPodcastMilliseconds":  "number"
  },
  "topTracks": {
    "topTracks": [
      {
        "trackUri":  "string (spotify:track:...)",
        "count":     "number",
        "msPlayed":  "number"
      }
    ],
    "numUniqueTracks": "number"
  },
  "yearlyMetrics": {
    "totalMsListened": "number"
  },
  "topAlbums": {
    "topAlbums":          ["string (spotify:album:...)"],
    "numCompletedAlbums": "number",
    "topAlbumTimePlayed": "number"
  },
  "topGenres": {
    "topGenres":      ["string (spotify:concept:...)"],
    "totalNumGenres": "number"
  },
  "clubs": {
    "userClub":       "string",
    "percentInClub":  "number",
    "role":           "string",
    "artists":        ["string (spotify:artist:...)"]
  },
  "listeningAge": {
    "listeningAge":    "number",
    "windowStartYear": "number",
    "decadePhase":     "string"
  },
  "party": {
    "avgTrackPopularityScore":      "number",
    "numListenedAlbums":            "number",
    "numMinsPlayedNews":            "number",
    "multilinguistRankingScore":    "number",
    "absoluteChaosRankingScore":    "number",
    "topArtistUris":                ["string (spotify:artist:...)"],
    "percentListenedNight":         "number",
    "percentListenedTopArtist":     "number",
    "topArtistUri":                 "string (spotify:artist:...)",
    "totalNumListeningMinutes":     "number",
    "totalNumListeningDays":        "number",
    "streakNumListeningDays":       "number",
    "numArtistsDiscovered":         "number",
    "artistsDiscovered":            ["string (spotify:artist:...)"],
    "percentChillTracks":           "number",
    "percentSadTracks":             "number",
    "percentLoveTracks":            "number",
    "percentPartyTracks":           "number",
    "trackStreams": [
      {
        "track_uri": "string (spotify:track:...)"
      }
    ]
  },
  "topArtistRace": {
    "topArtists": [
      {
        "artistUri": "string (spotify:artist:...)",
        "monthsStats": [
          {
            "rank":      "number",
            "month":     "string (e.g. JANUARY)",
            "trailSize": "string (VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH)"
          }
        ]
      }
    ],
    "totalNumArtists": "number",
    "insights": [
      {
        "month":     "string",
        "artistUri": "string (spotify:artist:...)",
        "uri":       "string (spotify URI)",
        "insightMetric": {
          "insightType": "string (e.g. TRACK_X_DAY_STREAK | ALBUM_X_DAY_STREAK | ARTIST_X_STREAMS)",
          "value":       "number"
        }
      }
    ]
  }
}
```

---

## YourLibrary.json

```json
{
  "tracks": [
    {
      "artist": "string",
      "album":  "string",
      "track":  "string",
      "uri":    "string (spotify:track:...)"
    }
  ],
  "albums": [
    {
      "artist": "string",
      "album":  "string",
      "uri":    "string (spotify:album:...)"
    }
  ],
  "shows": [
    {
      "name":      "string",
      "publisher": "string",
      "uri":       "string (spotify:show:...)"
    }
  ],
  "episodes": [
    {
      "name":  "string",
      "show":  "string",
      "uri":   "string (spotify:episode:...)"
    }
  ],
  "bannedTracks": [],
  "artists": [
    {
      "name": "string",
      "uri":  "string (spotify:artist:...)"
    }
  ]
}
```

---

## YourSoundCapsule.json

```json
{
  "stats": [
    {
      "date":          "string (YYYY-MM-DD)",
      "streamCount":   "number",
      "secondsPlayed": "number",
      "topTracks": [
        {
          "name":          "string",
          "streamCount":   "number",
          "secondsPlayed": "number"
        }
      ],
      "topArtists": [
        {
          "name":          "string",
          "streamCount":   "number",
          "secondsPlayed": "number"
        }
      ]
    }
  ]
}
```

---

*Generado el 2026-03-10*
