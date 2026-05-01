using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Compact top-level weather/time HUD widget. Shows current condition and local-ish
    /// time parsed from the live weather payload, and can toggle a larger weather panel.
    /// </summary>
    public class WeatherHudWidget : MonoBehaviour
    {
        [Header("Data Source")]
        public WeatherApiClient weatherClient;

        [Header("Toggle Target")]
        public GameObject weatherHudTarget;
        public bool startCollapsed = true;

        private Image _panel;
        private Button _button;
        private TextMeshProUGUI _timeText;
        private TextMeshProUGUI _weatherText;
        private TextMeshProUGUI _metaText;
        private TextMeshProUGUI _hintText;

        private void Awake()
        {
            BuildIfNeeded();
            EnsureSafeWeatherTarget();
            SetWeatherPanelVisible(!startCollapsed);
        }

        private void OnEnable()
        {
            if (weatherClient == null)
                weatherClient = FindFirstObjectByType<WeatherApiClient>();

            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated += HandleWeatherUpdated;
                weatherClient.OnWeatherError += HandleWeatherError;

                if (weatherClient.LatestWeather != null)
                    HandleWeatherUpdated(weatherClient.LatestWeather);
            }
            else
            {
                SetFallbackState("Weather client missing");
            }
        }

        private void OnDisable()
        {
            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated -= HandleWeatherUpdated;
                weatherClient.OnWeatherError -= HandleWeatherError;
            }
        }

        public void ToggleWeatherPanel()
        {
            EnsureSafeWeatherTarget();
            if (weatherHudTarget == null)
                return;

            SetWeatherPanelVisible(!weatherHudTarget.activeSelf);
        }

        private void SetWeatherPanelVisible(bool visible)
        {
            EnsureSafeWeatherTarget();
            if (weatherHudTarget != null)
                weatherHudTarget.SetActive(visible);
        }

        private void EnsureSafeWeatherTarget()
        {
            if (IsUnsafeTarget(weatherHudTarget))
                weatherHudTarget = null;

            if (weatherHudTarget != null)
                return;

            var existing = GameObject.Find("WeatherDetailsHUD");
            if (existing != null && !IsUnsafeTarget(existing))
            {
                weatherHudTarget = existing;
                return;
            }

            var parent = transform.parent != null ? transform.parent : transform;
            weatherHudTarget = CreateFallbackWeatherDetails(parent);
        }

        private bool IsUnsafeTarget(GameObject target)
        {
            if (target == null)
                return false;

            if (target == gameObject || target.transform.IsChildOf(transform))
                return true;

            var n = target.name;
            return n == "CityverseHUD" || n == "HUDPanel" || n == "WeatherHudWidget" || n == "WeatherWidgetPanel";
        }

        private GameObject CreateFallbackWeatherDetails(Transform parent)
        {
            var go = new GameObject("WeatherDetailsHUD", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster), typeof(Image));
            go.transform.SetParent(parent, false);

            var canvas = go.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 519;

            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(0f, 1f);
            rt.pivot = new Vector2(0f, 1f);
            rt.sizeDelta = new Vector2(420f, 220f);
            rt.anchoredPosition = new Vector2(24f, -164f);

            var img = go.GetComponent<Image>();
            img.color = CityverseBuildingUI.Theme.ExpertPanelFill;
            img.raycastTarget = false;

            var outline = go.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);

            var title = CityverseBuildingUI.AddText("WeatherDetailsText", rt, "Weather details\nWaiting for live weather data…", 20f, CityverseBuildingUI.Theme.ExpertTextSecondary, FontStyles.Normal);
            title.enableWordWrapping = true;
            CityverseBuildingUI.Anchor(title.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-36f, -36f), new Vector2(18f, -18f));

            go.SetActive(false);
            return go;
        }

        private void BuildIfNeeded()
        {
            if (_panel != null)
                return;

            CityverseBuildingUI.EnsureCanvasDependencies(gameObject, worldSpace: false);
            var canvas = GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 520;

            var root = GetComponent<RectTransform>();
            if (root == null)
                root = gameObject.AddComponent<RectTransform>();
            root.anchorMin = Vector2.zero;
            root.anchorMax = Vector2.one;
            root.offsetMin = Vector2.zero;
            root.offsetMax = Vector2.zero;

            _panel = CityverseBuildingUI.AddImage("WeatherWidgetPanel", transform, CityverseBuildingUI.Theme.ExpertPanelFill);
            var panelRt = _panel.rectTransform;
            CityverseBuildingUI.Anchor(panelRt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(360f, 126f), new Vector2(24f, -24f));
            var outline = _panel.gameObject.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);

            _button = _panel.gameObject.AddComponent<Button>();
            var colors = _button.colors;
            colors.normalColor = Color.white;
            colors.highlightedColor = new Color(1f, 1f, 1f, 0.96f);
            colors.pressedColor = new Color(0.92f, 0.96f, 1f, 1f);
            colors.selectedColor = Color.white;
            colors.disabledColor = new Color(1f, 1f, 1f, 0.5f);
            _button.colors = colors;
            _button.onClick.AddListener(ToggleWeatherPanel);

            _timeText = CityverseBuildingUI.AddText("TimeText", panelRt, DateTime.Now.ToString("HH:mm"), 32f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            _timeText.enableWordWrapping = false;
            CityverseBuildingUI.Anchor(_timeText.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(132f, 38f), new Vector2(18f, -12f));

            _weatherText = CityverseBuildingUI.AddText("WeatherText", panelRt, "Loading weather…", 22f, CityverseBuildingUI.Theme.ExpertTextSecondary, FontStyles.Bold);
            _weatherText.enableWordWrapping = false;
            CityverseBuildingUI.Anchor(_weatherText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-36f, 30f), new Vector2(18f, -50f));

            _metaText = CityverseBuildingUI.AddText("MetaText", panelRt, "Waiting for live weather", 16f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal);
            _metaText.enableWordWrapping = false;
            CityverseBuildingUI.Anchor(_metaText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-36f, 24f), new Vector2(18f, -80f));

            _hintText = CityverseBuildingUI.AddText("HintText", panelRt, "Click for details", 14f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal);
            _hintText.enableWordWrapping = false;
            CityverseBuildingUI.Anchor(_hintText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-36f, 20f), new Vector2(18f, -102f));
        }

        private void HandleWeatherUpdated(WeatherStateDto dto)
        {
            BuildIfNeeded();
            _timeText.text = TryFormatTime(dto.updatedAt);
            _weatherText.text = $"{FormatCondition(dto.condition)} · {dto.temperatureC:F1}°C";
            _metaText.text = dto.isDaytime
                ? $"{FormatSeason(dto.season)} day · wind {dto.windSpeedMs:F1} m/s"
                : $"{FormatSeason(dto.season)} night · wind {dto.windSpeedMs:F1} m/s";
            if (_hintText != null)
                _hintText.text = "Click for weather details";
            UpdateFallbackDetails(dto);
        }

        private void HandleWeatherError(string message)
        {
            SetFallbackState("Weather unavailable");
            if (_metaText != null)
                _metaText.text = Shorten(message, 42);
        }

        private void UpdateFallbackDetails(WeatherStateDto dto)
        {
            if (weatherHudTarget == null || dto == null)
                return;

            var text = weatherHudTarget.transform.Find("WeatherDetailsText")?.GetComponent<TextMeshProUGUI>();
            if (text == null)
                return;

            text.text =
                $"Weather details\n" +
                $"Condition: {FormatCondition(dto.condition)}\n" +
                $"Temperature: {dto.temperatureC:F1}°C (feels {dto.feelsLikeC:F1}°C)\n" +
                $"Wind: {dto.windSpeedMs:F1} m/s @ {dto.windDirectionDeg:F0}°\n" +
                $"Clouds: {dto.cloudCover * 100f:F0}% · Rain: {dto.precipitationMmH:F2} mm/h\n" +
                $"{(dto.isDaytime ? "Day" : "Night")} · {FormatSeason(dto.season)} · Updated {TryFormatTime(dto.updatedAt)}";
        }

        private static string TryFormatTime(string isoTimestamp)
        {
            if (DateTime.TryParse(isoTimestamp, out var dateTime))
                return dateTime.ToLocalTime().ToString("HH:mm");
            return DateTime.Now.ToString("HH:mm");
        }

        private static string FormatCondition(string condition)
        {
            if (string.IsNullOrWhiteSpace(condition))
                return "Unknown";
            return condition.Replace("_", " ");
        }

        private static string FormatSeason(string season)
        {
            return string.IsNullOrWhiteSpace(season) ? "Live" : season;
        }

        private void SetFallbackState(string weatherText)
        {
            BuildIfNeeded();
            _timeText.text = DateTime.Now.ToString("HH:mm");
            _weatherText.text = weatherText;
            _metaText.text = "No live weather payload yet";
            if (_hintText != null)
                _hintText.text = "Click for details";
        }

        private static string Shorten(string value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "No live weather payload yet";
            return value.Length <= maxLength ? value : value.Substring(0, maxLength - 1) + "…";
        }
    }
}
