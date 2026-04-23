using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// World-space quick info card for a selected or hovered building.
    /// First implementation is code-built so it can be dropped into the scene fast,
    /// then later replaced by a prefab without changing binding logic.
    /// </summary>
    public class BuildingQuickCardView : MonoBehaviour
    {
        [Header("Card Mode")]
        public CityverseBuildingUI.BuildingCardMode mode = CityverseBuildingUI.BuildingCardMode.Expert;

        [Header("World Card Settings")]
        public Vector2 size = new Vector2(320f, 180f);
        public Vector3 localOffset = new Vector3(0f, 4f, 0f);
        public Vector3 worldScale = new Vector3(0.01f, 0.01f, 0.01f);
        public bool faceMainCamera = true;

        private RectTransform _panel;
        private Image _panelImage;
        private Image _statusDot;
        private TextMeshProUGUI _titleText;
        private TextMeshProUGUI _metaText;
        private TextMeshProUGUI _demandValueText;
        private TextMeshProUGUI _occupancyValueText;
        private TextMeshProUGUI _footerText;
        private Image _occupancyBarFill;
        private Canvas _canvas;

        private void Awake()
        {
            BuildIfNeeded();
        }

        private void LateUpdate()
        {
            if (!faceMainCamera || _canvas == null)
                return;

            var cam = Camera.main;
            if (cam == null)
                return;

            transform.rotation = Quaternion.LookRotation(transform.position - cam.transform.position);
        }

        public void Apply(CityverseBuildingUI.BuildingViewModel vm)
        {
            BuildIfNeeded();

            if (mode == CityverseBuildingUI.BuildingCardMode.Kids)
                ApplyKids(vm);
            else
                ApplyExpert(vm);
        }

        private void BuildIfNeeded()
        {
            if (_panel != null)
                return;

            CityverseBuildingUI.EnsureCanvasDependencies(gameObject, worldSpace: true);
            _canvas = GetComponent<Canvas>();
            _canvas.renderMode = RenderMode.WorldSpace;

            var root = GetComponent<RectTransform>();
            if (root == null)
                root = gameObject.AddComponent<RectTransform>();
            root.sizeDelta = size;

            transform.localPosition = localOffset;
            transform.localScale = worldScale;

            _panelImage = CityverseBuildingUI.AddImage("Panel", transform, CityverseBuildingUI.Theme.ExpertPanelFill);
            _panelImage.raycastTarget = false;
            _panel = _panelImage.rectTransform;
            CityverseBuildingUI.Stretch(_panel, Vector2.zero, Vector2.zero);

            var outline = _panel.gameObject.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);

            _statusDot = CityverseBuildingUI.AddImage("StatusDot", _panel, CityverseBuildingUI.Theme.ExpertAccent);
            _statusDot.raycastTarget = false;
            CityverseBuildingUI.Anchor(_statusDot.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(14f, 14f), new Vector2(16f, -16f));

            _titleText = CityverseBuildingUI.AddText("Title", _panel, "Building", 28f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold);
            _titleText.enableWordWrapping = true;
            CityverseBuildingUI.Anchor(_titleText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-56f, 40f), new Vector2(38f, -12f));

            _metaText = CityverseBuildingUI.AddText("Meta", _panel, "TYPE", 16f, CityverseBuildingUI.Theme.ExpertTextMuted, FontStyles.Normal);
            CityverseBuildingUI.Anchor(_metaText.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-56f, 28f), new Vector2(38f, -48f));

            var demandLabel = CityverseBuildingUI.AddText("DemandLabel", _panel, "DEMAND", 14f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Bold);
            CityverseBuildingUI.Anchor(demandLabel.rectTransform, new Vector2(0f, 1f), new Vector2(0.5f, 1f), new Vector2(0f, 1f), new Vector2(-24f, 22f), new Vector2(16f, -86f));

            _demandValueText = CityverseBuildingUI.AddText("DemandValue", _panel, "0.0 kW", 24f, CityverseBuildingUI.Theme.ExpertWarn, FontStyles.Bold);
            CityverseBuildingUI.Anchor(_demandValueText.rectTransform, new Vector2(0f, 1f), new Vector2(0.5f, 1f), new Vector2(0f, 1f), new Vector2(-24f, 30f), new Vector2(16f, -108f));

            var occLabel = CityverseBuildingUI.AddText("OccupancyLabel", _panel, "OCCUPANCY", 14f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Bold, TextAlignmentOptions.TopRight);
            CityverseBuildingUI.Anchor(occLabel.rectTransform, new Vector2(0.5f, 1f), new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(-24f, 22f), new Vector2(-16f, -86f));

            _occupancyValueText = CityverseBuildingUI.AddText("OccupancyValue", _panel, "0%", 24f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold, TextAlignmentOptions.TopRight);
            CityverseBuildingUI.Anchor(_occupancyValueText.rectTransform, new Vector2(0.5f, 1f), new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(-24f, 30f), new Vector2(-16f, -108f));

            var barBg = CityverseBuildingUI.AddImage("OccupancyBarBg", _panel, CityverseBuildingUI.Theme.ExpertBorderSoft);
            barBg.raycastTarget = false;
            CityverseBuildingUI.Anchor(barBg.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0.5f, 0f), new Vector2(-32f, 10f), new Vector2(0f, 30f));

            _occupancyBarFill = CityverseBuildingUI.AddImage("OccupancyBarFill", barBg.transform, CityverseBuildingUI.Theme.ExpertAccent);
            _occupancyBarFill.raycastTarget = false;
            var fillRt = _occupancyBarFill.rectTransform;
            fillRt.anchorMin = new Vector2(0f, 0f);
            fillRt.anchorMax = new Vector2(0f, 1f);
            fillRt.pivot = new Vector2(0f, 0.5f);
            fillRt.anchoredPosition = Vector2.zero;
            fillRt.sizeDelta = new Vector2(120f, 0f);

            _footerText = CityverseBuildingUI.AddText("Footer", _panel, "Updated --", 14f, CityverseBuildingUI.Theme.ExpertTextQuiet, FontStyles.Normal, TextAlignmentOptions.BottomLeft);
            DisableRaycastTargets();
            CityverseBuildingUI.Anchor(_footerText.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 0f), new Vector2(-32f, 20f), new Vector2(16f, 8f));
        }

        private void DisableRaycastTargets()
        {
            foreach (var graphic in GetComponentsInChildren<Graphic>(true))
                graphic.raycastTarget = false;
        }

        private void ApplyExpert(CityverseBuildingUI.BuildingViewModel vm)
        {
            var statusColor = CityverseBuildingUI.GetStatusColor(vm);
            _panelImage.color = CityverseBuildingUI.Theme.ExpertPanelFill;
            _statusDot.color = statusColor;
            _titleText.color = CityverseBuildingUI.Theme.ExpertTextPrimary;
            _titleText.text = vm.Name;
            _metaText.color = CityverseBuildingUI.Theme.ExpertTextMuted;
            _metaText.text = $"{vm.Type.ToUpperInvariant()}  ·  {CityverseBuildingUI.GetStatusWord(vm).ToUpperInvariant()}";
            _demandValueText.color = statusColor;
            _demandValueText.text = $"{vm.DemandKw:F1} kW";
            _occupancyValueText.color = CityverseBuildingUI.Theme.ExpertTextPrimary;
            _occupancyValueText.text = $"{Mathf.RoundToInt(vm.OccupancyPercent * 100f)}%";
            _occupancyBarFill.color = CityverseBuildingUI.Theme.ExpertAccent;
            _occupancyBarFill.rectTransform.sizeDelta = new Vector2((size.x - 32f) * vm.OccupancyPercent, 0f);
            _footerText.color = CityverseBuildingUI.Theme.ExpertTextQuiet;
            _footerText.text = $"{vm.Id}   ·   Δ {vm.DemandDeltaKw:+0.0;-0.0;0.0} kW";
        }

        private void ApplyKids(CityverseBuildingUI.BuildingViewModel vm)
        {
            var statusColor = CityverseBuildingUI.GetKidsStatusColor(vm);
            _panelImage.color = CityverseBuildingUI.Theme.KidsPanel;
            _statusDot.color = statusColor;
            _titleText.color = CityverseBuildingUI.Theme.KidsTextPrimary;
            _titleText.text = $"{vm.Emoji} {vm.KidsName}";
            _metaText.color = CityverseBuildingUI.Theme.KidsTextMuted;
            _metaText.text = $"{vm.KidsType}  ·  {CityverseBuildingUI.GetKidsStatusWord(vm)}";
            _demandValueText.color = statusColor;
            _demandValueText.text = $"⚡ {vm.DemandKw:F0} kW";
            _occupancyValueText.color = CityverseBuildingUI.Theme.KidsTextPrimary;
            _occupancyValueText.text = $"👥 {vm.Occupancy}/{vm.Capacity}";
            _occupancyBarFill.color = CityverseBuildingUI.Theme.KidsBusy;
            _occupancyBarFill.rectTransform.sizeDelta = new Vector2((size.x - 32f) * vm.OccupancyPercent, 0f);
            _footerText.color = CityverseBuildingUI.Theme.KidsTextMuted;
            _footerText.text = $"Weather x{vm.WeatherFactor:F2}";
        }
    }
}
