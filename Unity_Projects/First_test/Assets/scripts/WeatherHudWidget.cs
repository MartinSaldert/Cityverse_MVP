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

        private void Awake()
        {
            BuildIfNeeded();
            SetWeatherPanelVisible(!startCollapsed);
        }

        private void OnEnable()
        {
            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated += HandleWeatherUpdated;
                weatherClient.OnWeatherError += HandleWeatherError;
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
            if (weatherHudTarget == null)
                return;

            SetWeatherPanelVisible(!weatherHudTarget.activeSelf);
        }

        private void SetWeatherPanelVisible(bool visible)
        {
            if (weatherHudTarget != null)
                weatherHudTarget.SetActive(visible);
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
            CityverseBuildingUI.Anchor(panelRt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(300f, 84f), new Vector2(24f, -24f));
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

            _timeText = CityverseBuildingUI.AddText("TimeText", panelRt, "--:--", 28f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_timeText.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(120f, 32f), new Vector2(18f, -14f));

            _weatherText = CityverseBuildingUI.AddText("WeatherText", panelRt, "Weather", 18f, CityverseBuildingUI.Theme.ExpertTextSecondary, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_weatherText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-132f, 24f), new Vector2(18f, -44f));

            _metaText = CityverseBuildingUI.AddText("MetaText", panelRt, "Click for weather details", 13f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal);
            CityverseBuildingUI.Anchor(_metaText.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 0f), new Vector2(-36f, 18f), new Vector2(18f, 10f));
        }

        private void HandleWeatherUpdated(WeatherStateDto dto)
        {
            _timeText.text = TryFormatTime(dto.updatedAt);
            _weatherText.text = $"{FormatCondition(dto.condition)}  ·  {dto.temperatureC:F1}°C";
            _metaText.text = dto.isDaytime
                ? $"{dto.season} day  ·  wind {dto.windSpeedMs:F1} m/s  ·  click for weather"
                : $"{dto.season} night  ·  wind {dto.windSpeedMs:F1} m/s  ·  click for weather";
        }

        private void HandleWeatherError(string message)
        {
            _weatherText.text = "Weather unavailable";
            _metaText.text = message;
        }

        private static string TryFormatTime(string isoTimestamp)
        {
            if (DateTime.TryParse(isoTimestamp, out var dateTime))
                return dateTime.ToLocalTime().ToString("HH:mm");
            return "--:--";
        }

        private static string FormatCondition(string condition)
        {
            if (string.IsNullOrWhiteSpace(condition))
                return "Unknown";
            return condition.Replace("_", " ");
        }
    }
}
