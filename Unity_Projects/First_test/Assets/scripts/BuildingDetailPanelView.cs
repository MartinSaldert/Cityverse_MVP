using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Screen-space building detail HUD panel based on the Claude Design expert card.
    /// Implemented in code first so we can iterate quickly, then later swap to prefabs.
    /// </summary>
    public class BuildingDetailPanelView : MonoBehaviour
    {
        [Header("Panel Mode")]
        public CityverseBuildingUI.BuildingCardMode mode = CityverseBuildingUI.BuildingCardMode.Expert;
        public Vector2 panelSize = new Vector2(440f, 560f);
        public bool startHidden = true;

        private RectTransform _panel;
        private Image _panelImage;
        private Image _statusDot;
        private TextMeshProUGUI _eyebrowText;
        private TextMeshProUGUI _titleText;
        private TextMeshProUGUI _metaText;
        private TextMeshProUGUI _statusText;
        private TextMeshProUGUI _demandValue;
        private TextMeshProUGUI _baseValue;
        private TextMeshProUGUI _deltaValue;
        private TextMeshProUGUI _occupancyValue;
        private TextMeshProUGUI _occupancyFactorText;
        private Image _occupancyFill;
        private TextMeshProUGUI _weatherValue;
        private TextMeshProUGUI _weatherMetaText;
        private Image _weatherFill;
        private TextMeshProUGUI _updatedFooter;
        private TextMeshProUGUI _reserveMetrics;

        private void Awake()
        {
            BuildIfNeeded();
            gameObject.SetActive(!startHidden);
        }

        public void Apply(CityverseBuildingUI.BuildingViewModel vm)
        {
            BuildIfNeeded();
            if (mode == CityverseBuildingUI.BuildingCardMode.Kids)
                ApplyKids(vm);
            else
                ApplyExpert(vm);
        }

        public void Show(bool visible)
        {
            if (gameObject.activeSelf != visible)
                gameObject.SetActive(visible);
        }

        private void BuildIfNeeded()
        {
            if (_panel != null)
                return;

            CityverseBuildingUI.EnsureCanvasDependencies(gameObject, worldSpace: false);
            var canvas = GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 500;

            var root = GetComponent<RectTransform>();
            if (root == null)
                root = gameObject.AddComponent<RectTransform>();
            root.anchorMin = Vector2.zero;
            root.anchorMax = Vector2.one;
            root.offsetMin = Vector2.zero;
            root.offsetMax = Vector2.zero;

            _panelImage = CityverseBuildingUI.AddImage("Panel", transform, CityverseBuildingUI.Theme.ExpertPanelFill);
            _panelImage.raycastTarget = false;
            _panel = _panelImage.rectTransform;
            CityverseBuildingUI.Anchor(_panel, new Vector2(1f, 0.5f), new Vector2(1f, 0.5f), new Vector2(1f, 0.5f), panelSize, new Vector2(-40f, 0f));

            var outline = _panel.gameObject.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);

            _statusDot = CityverseBuildingUI.AddImage("StatusDot", _panel, CityverseBuildingUI.Theme.ExpertAccent);
            _statusDot.raycastTarget = false;
            CityverseBuildingUI.Anchor(_statusDot.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(12f, 12f), new Vector2(18f, -18f));

            _eyebrowText = CityverseBuildingUI.AddText("Eyebrow", _panel, "BUILDING", 14f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_eyebrowText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-56f, 24f), new Vector2(38f, -14f));

            _titleText = CityverseBuildingUI.AddText("Title", _panel, "Building", 30f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            _titleText.enableWordWrapping = true;
            CityverseBuildingUI.Anchor(_titleText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-80f, 52f), new Vector2(16f, -40f));

            _metaText = CityverseBuildingUI.AddText("Meta", _panel, "id · type", 16f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Normal);
            CityverseBuildingUI.Anchor(_metaText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-120f, 22f), new Vector2(16f, -94f));

            _statusText = CityverseBuildingUI.AddText("Status", _panel, "Nominal", 16f, CityverseBuildingUI.Theme.ExpertAccent, FontStyles.Bold, TextAlignmentOptions.TopRight);
            CityverseBuildingUI.Anchor(_statusText.rectTransform, new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(130f, 24f), new Vector2(-18f, -18f));

            CreateMetricBlock("Current Demand", out _demandValue, new Vector2(16f, -142f), 0);
            CreateMetricBlock("Base Demand", out _baseValue, new Vector2(154f, -142f), 1);
            CreateMetricBlock("Δ Delta", out _deltaValue, new Vector2(292f, -142f), 2);

            var occLabel = CityverseBuildingUI.AddText("OccupancyLabel", _panel, "OCCUPANCY", 13f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Bold);
            CityverseBuildingUI.Anchor(occLabel.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-32f, 20f), new Vector2(16f, -232f));

            _occupancyValue = CityverseBuildingUI.AddText("OccupancyValue", _panel, "0 / 0 ppl", 21f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_occupancyValue.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-32f, 28f), new Vector2(16f, -254f));

            var occBarBg = CityverseBuildingUI.AddImage("OccupancyBarBg", _panel, CityverseBuildingUI.Theme.ExpertBorderSoft);
            occBarBg.raycastTarget = false;
            CityverseBuildingUI.Anchor(occBarBg.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0.5f, 1f), new Vector2(-32f, 10f), new Vector2(0f, -294f));

            _occupancyFill = CityverseBuildingUI.AddImage("OccupancyBarFill", occBarBg.transform, CityverseBuildingUI.Theme.ExpertAccent);
            _occupancyFill.raycastTarget = false;
            var occFillRt = _occupancyFill.rectTransform;
            occFillRt.anchorMin = new Vector2(0f, 0f);
            occFillRt.anchorMax = new Vector2(0f, 1f);
            occFillRt.pivot = new Vector2(0f, 0.5f);
            occFillRt.anchoredPosition = Vector2.zero;
            occFillRt.sizeDelta = new Vector2(120f, 0f);

            _occupancyFactorText = CityverseBuildingUI.AddText("OccupancyMeta", _panel, "FACTOR 0.00× · 0%", 13f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal);
            CityverseBuildingUI.Anchor(_occupancyFactorText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-32f, 22f), new Vector2(16f, -310f));

            var weatherLabel = CityverseBuildingUI.AddText("WeatherLabel", _panel, "WEATHER", 13f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Bold);
            CityverseBuildingUI.Anchor(weatherLabel.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-32f, 20f), new Vector2(16f, -356f));

            _weatherValue = CityverseBuildingUI.AddText("WeatherValue", _panel, "1.00×", 21f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_weatherValue.rectTransform, new Vector2(0f, 1f), new Vector2(0.5f, 1f), new Vector2(0f, 1f), new Vector2(-16f, 28f), new Vector2(16f, -378f));

            _weatherMetaText = CityverseBuildingUI.AddText("WeatherMeta", _panel, "Weather influence on demand", 13f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal, TextAlignmentOptions.TopRight);
            _weatherMetaText.enableWordWrapping = true;
            CityverseBuildingUI.Anchor(_weatherMetaText.rectTransform, new Vector2(0.5f, 1f), new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(-16f, 40f), new Vector2(-16f, -378f));

            var weatherBarBg = CityverseBuildingUI.AddImage("WeatherBarBg", _panel, CityverseBuildingUI.Theme.ExpertBorderSoft);
            weatherBarBg.raycastTarget = false;
            CityverseBuildingUI.Anchor(weatherBarBg.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0.5f, 1f), new Vector2(-32f, 10f), new Vector2(0f, -430f));

            _weatherFill = CityverseBuildingUI.AddImage("WeatherBarFill", weatherBarBg.transform, CityverseBuildingUI.Theme.ExpertWarn);
            _weatherFill.raycastTarget = false;
            var weatherFillRt = _weatherFill.rectTransform;
            weatherFillRt.anchorMin = new Vector2(0f, 0f);
            weatherFillRt.anchorMax = new Vector2(0f, 1f);
            weatherFillRt.pivot = new Vector2(0f, 0.5f);
            weatherFillRt.anchoredPosition = Vector2.zero;
            weatherFillRt.sizeDelta = new Vector2(120f, 0f);

            _reserveMetrics = CityverseBuildingUI.AddText("Reserve", _panel, "CO₂  —    Battery  —    District  —    Alerts 0", 13f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal);
            _reserveMetrics.enableWordWrapping = true;
            CityverseBuildingUI.Anchor(_reserveMetrics.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 0f), new Vector2(-32f, 44f), new Vector2(16f, 40f));

            _updatedFooter = CityverseBuildingUI.AddText("Footer", _panel, "Last updated --", 12f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal, TextAlignmentOptions.BottomLeft);
            CityverseBuildingUI.Anchor(_updatedFooter.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 0f), new Vector2(-32f, 20f), new Vector2(16f, 14f));
            DisableRaycastTargets();
        }

        private void DisableRaycastTargets()
        {
            foreach (var graphic in GetComponentsInChildren<Graphic>(true))
                graphic.raycastTarget = false;
        }

        private void CreateMetricBlock(string label, out TextMeshProUGUI valueText, Vector2 anchoredPosition, int columnIndex)
        {
            var labelText = CityverseBuildingUI.AddText($"MetricLabel_{columnIndex}", _panel, label.ToUpperInvariant(), 12f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Bold);
            CityverseBuildingUI.Anchor(labelText.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(120f, 18f), anchoredPosition);

            valueText = CityverseBuildingUI.AddText($"MetricValue_{columnIndex}", _panel, "0.0 kW", 22f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            CityverseBuildingUI.Anchor(valueText.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(120f, 28f), anchoredPosition + new Vector2(0f, -18f));
        }

        private void ApplyExpert(CityverseBuildingUI.BuildingViewModel vm)
        {
            var statusColor = CityverseBuildingUI.GetStatusColor(vm);
            _panelImage.color = CityverseBuildingUI.Theme.ExpertPanelFill;
            _statusDot.color = statusColor;
            _eyebrowText.color = CityverseBuildingUI.Theme.ExpertTextMuted;
            _titleText.color = CityverseBuildingUI.Theme.ExpertTextPrimary;
            _metaText.color = CityverseBuildingUI.Theme.ExpertTextMuted;
            _statusText.color = statusColor;
            _demandValue.color = statusColor;
            _deltaValue.color = vm.DemandDeltaKw > 0f ? CityverseBuildingUI.Theme.ExpertWarn : CityverseBuildingUI.Theme.ExpertOk;
            _occupancyValue.color = CityverseBuildingUI.Theme.ExpertTextPrimary;
            _weatherValue.color = CityverseBuildingUI.Theme.ExpertTextPrimary;
            _weatherFill.color = CityverseBuildingUI.Theme.ExpertWarn;
            _occupancyFill.color = CityverseBuildingUI.Theme.ExpertAccent;

            _eyebrowText.text = "BUILDING";
            _titleText.text = vm.Name;
            _metaText.text = $"{vm.Id}  ·  {vm.Type}  ·  live";
            _statusText.text = CityverseBuildingUI.GetStatusWord(vm);
            _demandValue.text = $"{vm.DemandKw:F1} kW";
            _baseValue.text = $"{vm.BaseDemandKw:F1} kW";
            _deltaValue.text = $"{vm.DemandDeltaKw:+0.0;-0.0;0.0} kW";
            _occupancyValue.text = $"{vm.Occupancy} / {vm.Capacity} ppl";
            _occupancyFactorText.text = $"FACTOR {vm.OccupancyPercent:0.00}×  ·  {Mathf.RoundToInt(vm.OccupancyPercent * 100f)}%";
            _weatherValue.text = $"{vm.WeatherFactor:F2}×";
            _weatherMetaText.text = vm.WeatherFactor > 1.15f ? "Weather is pushing demand upward" : "Weather impact is mild";
            _reserveMetrics.text = "CO₂  — g/kWh    Battery  — %    District  —    Alerts  0";
            _updatedFooter.text = $"Last updated  ·  {vm.UpdatedAt}  ·  LIVE IOT";

            _occupancyFill.rectTransform.sizeDelta = new Vector2((panelSize.x - 32f) * vm.OccupancyPercent, 0f);
            var weatherPct = Mathf.Clamp01((vm.WeatherFactor - 0.8f) / 0.8f);
            _weatherFill.rectTransform.sizeDelta = new Vector2((panelSize.x - 32f) * weatherPct, 0f);
        }

        private void ApplyKids(CityverseBuildingUI.BuildingViewModel vm)
        {
            var statusColor = CityverseBuildingUI.GetKidsStatusColor(vm);
            _panelImage.color = CityverseBuildingUI.Theme.KidsPanel;
            _statusDot.color = statusColor;
            _eyebrowText.color = CityverseBuildingUI.Theme.KidsTextMuted;
            _titleText.color = CityverseBuildingUI.Theme.KidsTextPrimary;
            _metaText.color = CityverseBuildingUI.Theme.KidsTextMuted;
            _statusText.color = statusColor;
            _demandValue.color = statusColor;
            _deltaValue.color = statusColor;
            _occupancyValue.color = CityverseBuildingUI.Theme.KidsTextPrimary;
            _weatherValue.color = CityverseBuildingUI.Theme.KidsTextPrimary;
            _weatherFill.color = CityverseBuildingUI.Theme.KidsBusy;
            _occupancyFill.color = CityverseBuildingUI.Theme.KidsBusy;

            _eyebrowText.text = vm.KidsType.ToUpperInvariant();
            _titleText.text = $"{vm.Emoji} {vm.KidsName}";
            _metaText.text = "Right now, here is what this building is doing, live from IOT";
            _statusText.text = CityverseBuildingUI.GetKidsStatusWord(vm);
            _demandValue.text = $"{vm.DemandKw:F0} kW";
            _baseValue.text = $"Usually {vm.BaseDemandKw:F0} kW";
            _deltaValue.text = vm.DemandDeltaKw >= 0f ? $"+{vm.DemandDeltaKw:F0} extra" : $"{vm.DemandDeltaKw:F0} lower";
            _occupancyValue.text = $"👥 {vm.Occupancy} of {vm.Capacity}";
            _occupancyFactorText.text = $"{Mathf.RoundToInt(vm.OccupancyPercent * 100f)}% full";
            _weatherValue.text = $"⛅ x{vm.WeatherFactor:F2}";
            _weatherMetaText.text = vm.WeatherFactor > 1.15f ? "The weather is making it work harder" : "Weather is calm today";
            _reserveMetrics.text = "CO₂ later    Battery later    District later    Alerts 0";
            _updatedFooter.text = $"Updated just now  ·  {vm.UpdatedAt}  ·  LIVE IOT";

            _occupancyFill.rectTransform.sizeDelta = new Vector2((panelSize.x - 32f) * vm.OccupancyPercent, 0f);
            var weatherPct = Mathf.Clamp01((vm.WeatherFactor - 0.8f) / 0.8f);
            _weatherFill.rectTransform.sizeDelta = new Vector2((panelSize.x - 32f) * weatherPct, 0f);
        }
    }
}
