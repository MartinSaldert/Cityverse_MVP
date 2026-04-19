using System;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Mirrors the WeatherSummary shape returned by GET /weather/current.
    /// Fields match the JSON keys exactly so JsonUtility can deserialise directly.
    /// </summary>
    [Serializable]
    public class WeatherStateDto
    {
        public string condition;        // "clear" | "partly_cloudy" | "overcast" | "rain" | "storm" | "snow" | "fog"
        public float  temperatureC;
        public float  feelsLikeC;
        public float  humidity;         // 0-100 %
        public float  pressureHpa;
        public float  windSpeedMs;
        public float  windDirectionDeg; // 0-360
        public float  cloudCover;       // 0-1
        public float  precipitationMmH;
        public bool   isDaytime;
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
