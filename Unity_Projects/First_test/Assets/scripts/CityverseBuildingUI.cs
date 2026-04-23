using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Shared theme tokens and lightweight factory helpers for the first Canvas-based
    /// Cityverse building UI pass. Built to mirror the Claude Design expert card family
    /// without requiring hand-made prefabs on day one.
    /// </summary>
    public static class CityverseBuildingUI
    {
        public static class Theme
        {
            public static readonly Color ExpertPanelTop = Hex("#323740");
            public static readonly Color ExpertPanelBottom = Hex("#252A33");
            public static readonly Color ExpertPanelFill = Hex("#282D36");
            public static readonly Color ExpertBorder = Hex("#5F6671CC");
            public static readonly Color ExpertBorderSoft = Hex("#4E566266");
            public static readonly Color ExpertTextPrimary = Hex("#F8FAFC");
            public static readonly Color ExpertTextSecondary = Hex("#D3DBE4");
            public static readonly Color ExpertTextMuted = Hex("#B5C0CB");
            public static readonly Color ExpertTextQuiet = Hex("#8F9AAA");
            public static readonly Color ExpertAccent = Hex("#58D2E2");
            public static readonly Color ExpertOk = Hex("#73E47F");
            public static readonly Color ExpertWarn = Hex("#F5C25A");
            public static readonly Color ExpertCrit = Hex("#E07C55");
            public static readonly Color ExpertInfo = Hex("#78B5F3");

            public static readonly Color KidsPanel = Hex("#FFFFFF");
            public static readonly Color KidsPanelSoft = Hex("#FFEFD4");
            public static readonly Color KidsBorder = Hex("#E9DDC2");
            public static readonly Color KidsTextPrimary = Hex("#2B2418");
            public static readonly Color KidsTextSecondary = Hex("#4A3E2A");
            public static readonly Color KidsTextMuted = Hex("#7C6A4B");
            public static readonly Color KidsBusy = Hex("#F38B3C");
            public static readonly Color KidsHappy = Hex("#27B267");
            public static readonly Color KidsCozy = Hex("#9E74D8");
            public static readonly Color KidsAlert = Hex("#E65A4B");
        }

        public enum BuildingCardMode
        {
            Expert,
            Kids
        }

        public struct BuildingViewModel
        {
            public string Id;
            public string Name;
            public string Type;
            public string KidsName;
            public string KidsType;
            public string Emoji;
            public int Occupancy;
            public int Capacity;
            public float DemandKw;
            public float BaseDemandKw;
            public float WeatherFactor;
            public string UpdatedAt;
            public BuildingCardMode Mode;

            public float OccupancyPercent => Capacity <= 0 ? 0f : Mathf.Clamp01((float)Occupancy / Capacity);
            public float DemandDeltaKw => DemandKw - BaseDemandKw;
        }

        public static BuildingViewModel FromDto(BuildingStateDto dto, BuildingCardMode mode = BuildingCardMode.Expert)
        {
            return new BuildingViewModel
            {
                Id = dto?.id ?? string.Empty,
                Name = string.IsNullOrWhiteSpace(dto?.label) ? dto?.id ?? "Building" : dto.label,
                Type = string.IsNullOrWhiteSpace(dto?.type) ? "Building" : dto.type,
                KidsName = GetKidsName(dto),
                KidsType = GetKidsType(dto),
                Emoji = GetEmoji(dto),
                Occupancy = dto?.occupancyCount ?? 0,
                Capacity = dto?.occupancyCapacity ?? 0,
                DemandKw = dto?.currentDemandKw ?? 0f,
                BaseDemandKw = dto?.baseDemandKw ?? 0f,
                WeatherFactor = dto?.weatherFactor ?? 1f,
                UpdatedAt = dto?.updatedAt ?? "--",
                Mode = mode,
            };
        }

        public static string GetStatusWord(BuildingViewModel vm)
        {
            float delta = vm.DemandDeltaKw;
            float occ = vm.OccupancyPercent;
            if (delta > 8f || occ > 0.9f) return "High Load";
            if (delta > 2f || occ > 0.7f) return "Busy";
            if (delta < -1.5f && occ < 0.4f) return "Low Use";
            if (occ < 0.55f) return "Steady";
            return "Nominal";
        }

        public static string GetKidsStatusWord(BuildingViewModel vm)
        {
            float delta = vm.DemandDeltaKw;
            float occ = vm.OccupancyPercent;
            if (delta > 8f || occ > 0.9f) return "Busy right now";
            if (delta > 2f || occ > 0.7f) return "A bit busy";
            if (delta < -1.5f && occ < 0.4f) return "Quiet & cozy";
            return "All good";
        }

        public static Color GetStatusColor(BuildingViewModel vm)
        {
            float delta = vm.DemandDeltaKw;
            float occ = vm.OccupancyPercent;
            if (delta > 8f || occ > 0.9f) return Theme.ExpertWarn;
            if (delta < -1.5f && occ < 0.4f) return Theme.ExpertAccent;
            if (occ < 0.55f) return Theme.ExpertInfo;
            return Theme.ExpertOk;
        }

        public static Color GetKidsStatusColor(BuildingViewModel vm)
        {
            float delta = vm.DemandDeltaKw;
            float occ = vm.OccupancyPercent;
            if (delta > 8f || occ > 0.9f) return Theme.KidsBusy;
            if (delta < -1.5f && occ < 0.4f) return Theme.KidsCozy;
            return Theme.KidsHappy;
        }

        public static TMP_FontAsset GetDefaultFont()
        {
            return TMP_Settings.defaultFontAsset != null
                ? TMP_Settings.defaultFontAsset
                : Resources.GetBuiltinResource<TMP_FontAsset>("LiberationSans SDF.asset");
        }

        public static GameObject CreateUIObject(string name, Transform parent, params Type[] components)
        {
            var go = components != null && components.Length > 0
                ? new GameObject(name, components)
                : new GameObject(name);
            var rt = go.GetComponent<RectTransform>();
            if (rt == null)
                rt = go.AddComponent<RectTransform>();
            if (parent != null)
                rt.SetParent(parent, false);
            rt.localScale = Vector3.one;
            rt.localRotation = Quaternion.identity;
            return go;
        }

        public static RectTransform Stretch(RectTransform rt, Vector2 offsetMin, Vector2 offsetMax)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = offsetMin;
            rt.offsetMax = offsetMax;
            return rt;
        }

        public static RectTransform Anchor(RectTransform rt, Vector2 min, Vector2 max, Vector2 pivot, Vector2 size, Vector2 anchored)
        {
            rt.anchorMin = min;
            rt.anchorMax = max;
            rt.pivot = pivot;
            rt.sizeDelta = size;
            rt.anchoredPosition = anchored;
            return rt;
        }

        public static Image AddImage(string name, Transform parent, Color color)
        {
            var go = CreateUIObject(name, parent, typeof(Image));
            var image = go.GetComponent<Image>();
            image.color = color;
            image.sprite = GetDefaultSprite();
            image.type = Image.Type.Sliced;
            return image;
        }

        public static TextMeshProUGUI AddText(string name, Transform parent, string value, float fontSize, Color color,
            FontStyles style = FontStyles.Normal, TextAlignmentOptions align = TextAlignmentOptions.TopLeft)
        {
            var go = CreateUIObject(name, parent, typeof(TextMeshProUGUI));
            var text = go.GetComponent<TextMeshProUGUI>();
            text.text = value;
            text.fontSize = fontSize;
            text.color = color;
            text.fontStyle = style;
            text.alignment = align;
            text.enableWordWrapping = false;
            text.font = GetDefaultFont();
            return text;
        }


        public static Sprite GetDefaultSprite()
        {
            return Resources.GetBuiltinResource<Sprite>("UI/Skin/UISprite.psd");
        }

        public static void EnsureCanvasDependencies(GameObject root, bool worldSpace)
        {
            if (root.GetComponent<Canvas>() == null)
            {
                var canvas = root.AddComponent<Canvas>();
                canvas.renderMode = worldSpace ? RenderMode.WorldSpace : RenderMode.ScreenSpaceOverlay;
                canvas.overrideSorting = true;
                canvas.sortingOrder = worldSpace ? 20 : 200;
            }

            if (!worldSpace && root.GetComponent<GraphicRaycaster>() == null)
                root.AddComponent<GraphicRaycaster>();

            if (!worldSpace && root.GetComponent<CanvasScaler>() == null)
            {
                var scaler = root.AddComponent<CanvasScaler>();
                scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                scaler.referenceResolution = new Vector2(1920, 1080);
                scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
                scaler.matchWidthOrHeight = 0.5f;
            }

            if (worldSpace)
            {
                var rectTransform = root.GetComponent<RectTransform>();
                if (rectTransform != null && rectTransform.sizeDelta == Vector2.zero)
                    rectTransform.sizeDelta = new Vector2(320f, 180f);
            }
        }

        private static Color Hex(string hex)
        {
            if (ColorUtility.TryParseHtmlString(hex, out var color))
                return color;
            return Color.magenta;
        }

        private static string GetEmoji(BuildingStateDto dto)
        {
            var type = dto?.type?.ToLowerInvariant() ?? string.Empty;
            if (type.Contains("industrial") || type.Contains("factory")) return "🏭";
            if (type.Contains("office")) return "🏢";
            if (type.Contains("apartment")) return "🏬";
            if (type.Contains("villa") || type.Contains("home") || type.Contains("residential")) return "🏡";
            if (type.Contains("school") || type.Contains("civic")) return "🏫";
            if (type.Contains("utility") || type.Contains("power")) return "⚡";
            return "🏙️";
        }

        private static string GetKidsType(BuildingStateDto dto)
        {
            var type = dto?.type?.ToLowerInvariant() ?? string.Empty;
            if (type.Contains("industrial") || type.Contains("factory")) return "Factory";
            if (type.Contains("office")) return "Workplace";
            if (type.Contains("apartment")) return "Home";
            if (type.Contains("villa") || type.Contains("home") || type.Contains("residential")) return "Home";
            if (type.Contains("school") || type.Contains("civic")) return "School";
            if (type.Contains("utility") || type.Contains("power")) return "Helper";
            return string.IsNullOrWhiteSpace(dto?.type) ? "Building" : dto.type;
        }

        private static string GetKidsName(BuildingStateDto dto)
        {
            var id = dto?.id?.ToLowerInvariant() ?? string.Empty;
            var label = string.IsNullOrWhiteSpace(dto?.label) ? dto?.id ?? "Building" : dto.label;
            if (id.Contains("factory")) return "The Big Factory";
            if (id.Contains("office")) return "The Glass Office";
            if (id.Contains("apartment")) return "Apartment Tower";
            if (id.Contains("villa-a")) return "Little House A";
            if (id.Contains("villa-b")) return "Little House B";
            if (id.Contains("school")) return "The School";
            if (id.Contains("utility")) return "The Power Station";
            return label;
        }
    }
}
