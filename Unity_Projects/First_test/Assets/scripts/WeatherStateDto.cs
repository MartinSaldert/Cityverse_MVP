using System;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Mirrors the WeatherSummary shape returned by GET /weather/current.
    /// Fields match the JSON keys exactly so JsonUtility can deserialise directly.
    ///
    /// Lighting guidance:
    ///   Prefer sunrise, sunset, and daylightHours for lighting decisions.
    ///   The 'season' field is kept for backward compatibility but is now secondary —
    ///   date + location already determine the lighting context fully.
    /// </summary>
    [Serializable]
    public class WeatherStateDto
    {
        public string condition;        // "clear" | "partly_cloudy" | "overcast" | "rain" | "storm" | "snow" | "fog"
        public float  temperatureC;
        public float  feelsLikeC;
        public float  humidity;         // 0–100 %
        public float  pressureHpa;
        public float  windSpeedMs;
        public float  windDirectionDeg; // 0–360
        public float  cloudCover;       // 0–1
        public float  precipitationMmH;
        public bool   isDaytime;

        // Daylight context — use these for lighting transitions rather than 'season'
        public float  sunrise;          // decimal hour, e.g. 6.5 = 06:30
        public float  sunset;           // decimal hour, e.g. 19.75 = 19:45
        public float  daylightHours;    // total daylight duration for today
        public string locationId;       // selected simulation location id

        // Secondary — kept for backward compatibility; derived from date, not a primary input
        public string season;           // "spring" | "summer" | "autumn" | "winter"

        public string updatedAt;        // ISO-8601 datetime string
    }

    /// <summary>
    /// Top-level envelope: { ok: true, data: WeatherSummary }
    /// </summary>
    [Serializable]
    internal class WeatherApiResponse
    {
        public bool           ok;
        public WeatherStateDto data;
    }
}
