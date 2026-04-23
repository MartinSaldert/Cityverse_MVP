using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Small ambient world marker for buildings. Keeps the scene readable while still
    /// showing status at a glance. The full quick card is handled separately.
    /// </summary>
    public class BuildingMarkerView : MonoBehaviour
    {
        public CityverseBuildingUI.BuildingCardMode mode = CityverseBuildingUI.BuildingCardMode.Expert;
        public Vector3 localOffset = new Vector3(0f, 3.2f, 0f);
        public Vector3 worldScale = new Vector3(0.0065f, 0.0065f, 0.0065f);
        public bool faceMainCamera = true;

        private Canvas _canvas;
        private RectTransform _root;
        private Image _pill;
        private Image _statusDot;
        private TextMeshProUGUI _iconText;

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

        public void Apply(CityverseBuildingUI.BuildingViewModel vm, bool selected = false)
        {
            BuildIfNeeded();
            var color = mode == CityverseBuildingUI.BuildingCardMode.Kids
                ? CityverseBuildingUI.GetKidsStatusColor(vm)
                : CityverseBuildingUI.GetStatusColor(vm);

            _pill.color = mode == CityverseBuildingUI.BuildingCardMode.Kids
                ? (selected ? CityverseBuildingUI.Theme.KidsPanelSoft : CityverseBuildingUI.Theme.KidsPanel)
                : (selected ? CityverseBuildingUI.Theme.ExpertPanelTop : CityverseBuildingUI.Theme.ExpertPanelFill);

            _statusDot.color = color;
            _iconText.text = mode == CityverseBuildingUI.BuildingCardMode.Kids ? vm.Emoji : GetExpertGlyph(vm.Type);
            _iconText.color = mode == CityverseBuildingUI.BuildingCardMode.Kids
                ? CityverseBuildingUI.Theme.KidsTextPrimary
                : CityverseBuildingUI.Theme.ExpertTextPrimary;

            transform.localScale = selected ? worldScale * 1.12f : worldScale;
        }

        private void BuildIfNeeded()
        {
            if (_root != null)
                return;

            CityverseBuildingUI.EnsureCanvasDependencies(gameObject, worldSpace: true);
            _canvas = GetComponent<Canvas>();
            _canvas.renderMode = RenderMode.WorldSpace;

            var rect = GetComponent<RectTransform>();
            if (rect == null)
                rect = gameObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(84f, 32f);

            transform.localPosition = localOffset;
            transform.localScale = worldScale;

            _pill = CityverseBuildingUI.AddImage("MarkerPill", transform, CityverseBuildingUI.Theme.ExpertPanelFill);
            _root = _pill.rectTransform;
            CityverseBuildingUI.Stretch(_root, Vector2.zero, Vector2.zero);

            var outline = _pill.gameObject.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);
            _pill.raycastTarget = false;

            _statusDot = CityverseBuildingUI.AddImage("StatusDot", _root, CityverseBuildingUI.Theme.ExpertAccent);
            _statusDot.raycastTarget = false;
            CityverseBuildingUI.Anchor(_statusDot.rectTransform, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(12f, 12f), new Vector2(10f, 0f));

            _iconText = CityverseBuildingUI.AddText("Icon", _root, "▣", 20f, CityverseBuildingUI.Theme.ExpertTextPrimary, FontStyles.Bold, TextAlignmentOptions.Center);
            CityverseBuildingUI.Anchor(_iconText.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 1f), new Vector2(0.5f, 0.5f), new Vector2(-12f, -4f), new Vector2(6f, 0f));

            foreach (var graphic in GetComponentsInChildren<Graphic>(true))
                graphic.raycastTarget = false;
        }

        private static string GetExpertGlyph(string type)
        {
            var value = string.IsNullOrWhiteSpace(type) ? string.Empty : type.ToLowerInvariant();
            if (value.Contains("industrial") || value.Contains("factory")) return "▥";
            if (value.Contains("office")) return "▤";
            if (value.Contains("apartment")) return "▦";
            if (value.Contains("villa") || value.Contains("home") || value.Contains("residential")) return "⌂";
            if (value.Contains("school") || value.Contains("civic")) return "◫";
            if (value.Contains("utility")) return "◉";
            return "▣";
        }
    }
}
