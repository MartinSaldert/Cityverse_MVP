using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Deterministic scene installer for the current Cityverse building UX pass.
    /// Creates one marker per building, one shared quick card, one shared HUD detail panel,
    /// and one compact weather/time widget that can toggle weather details.
    /// </summary>
    public static class CityverseBuildingUIInstaller
    {
        private const string HudRootName = "CityverseHUD";
        private const string DetailHudName = "BuildingDetailHUD";
        private const string SharedQuickCardName = "SharedBuildingQuickCard";
        private const string ManagerName = "BuildingCardsManager";
        private const string WeatherWidgetName = "WeatherHudWidget";
        private const string WeatherDetailsName = "WeatherDetailsHUD";
        private const string QuickCardSuffix = "_QuickCardAnchor";
        private const string MarkerName = "Marker";
        private const string DefaultBuildingId = "factory-01";

#if UNITY_EDITOR
        [UnityEditor.MenuItem("Tools/Cityverse/Install Building UI")]
        public static void InstallMenuItem()
        {
            InstallOrUpdateInScene();
        }

        [UnityEditor.MenuItem("Tools/Cityverse/Switch To Expert Mode")]
        public static void SwitchToExpertMode()
        {
            SetModeWithoutReset(CityverseBuildingUI.BuildingCardMode.Expert);
        }

        [UnityEditor.MenuItem("Tools/Cityverse/Switch To Kids Mode")]
        public static void SwitchToKidsMode()
        {
            SetModeWithoutReset(CityverseBuildingUI.BuildingCardMode.Kids);
        }
#endif

        public static void InstallOrUpdateInScene(bool resetSelectionAndHideDetail = true)
        {
            var buildingsReceiver = GameObject.Find("BuildingsReceiver");
            if (buildingsReceiver == null)
            {
                Debug.LogError("[CityverseBuildingUIInstaller] BuildingsReceiver not found.");
                return;
            }

            var buildingsClient = buildingsReceiver.GetComponent<BuildingsApiClient>();
            if (buildingsClient == null)
            {
                Debug.LogError("[CityverseBuildingUIInstaller] BuildingsReceiver is missing BuildingsApiClient.");
                return;
            }

            var weatherReceiver = GameObject.Find("WeatherReceiverBehaviour");
            var weatherClient = weatherReceiver != null ? weatherReceiver.GetComponent<WeatherApiClient>() : null;
            if (weatherClient == null)
                weatherClient = Object.FindFirstObjectByType<WeatherApiClient>();

            EnsureEventSystem();
            var hudRoot = FindOrCreateHudRoot();

            var detailHud = FindOrCreateObject(DetailHudName, hudRoot.transform);
            var detailView = GetOrAddComponent<BuildingDetailPanelView>(detailHud);
            detailView.mode = CityverseBuildingUI.BuildingCardMode.Expert;
            detailView.startHidden = true;
            if (resetSelectionAndHideDetail)
                detailView.Show(false);

            var sharedQuickCard = FindOrCreateObject(SharedQuickCardName, hudRoot.transform);
            var sharedQuickCardView = GetOrAddComponent<BuildingQuickCardView>(sharedQuickCard);
            sharedQuickCardView.mode = CityverseBuildingUI.BuildingCardMode.Expert;
            sharedQuickCardView.localOffset = new Vector3(0f, 2f, 0f);
            sharedQuickCardView.worldScale = new Vector3(0.01f, 0.01f, 0.01f);
            sharedQuickCardView.faceMainCamera = true;
            sharedQuickCardView.gameObject.SetActive(false);

            var managerObject = FindOrCreateObject(ManagerName, hudRoot.transform);
            var manager = GetOrAddComponent<BuildingCardsManager>(managerObject);
            manager.buildingsClient = buildingsClient;
            manager.sharedQuickCardView = sharedQuickCardView;
            manager.detailPanelView = detailView;
            if (resetSelectionAndHideDetail)
                manager.ClearSelection();
            manager.mode = CityverseBuildingUI.BuildingCardMode.Expert;
            manager.showQuickCard = true;
            manager.hideQuickCardWhenNotHovering = true;
            manager.buildingCards.Clear();

            var raycaster = GetOrAddComponent<BuildingInteractionRaycaster>(managerObject);
            raycaster.targetCamera = Camera.main;

            RemoveAllExistingMarkers();

            DisableLegacySelectionControllers();

            var buildingRoots = FindAllBuildings();
            foreach (var building in buildingRoots)
            {
                if (building == null)
                    continue;

                DisableLegacyOverlay(building);

                var interactable = GetOrAddComponent<BuildingInteractable>(building);
                interactable.buildingId = building.name;
                interactable.cardsManager = manager;

                var anchor = FindOrCreateQuickCardAnchor(building.transform, building.name);
                var cardAnchor = GetOrAddComponent<BuildingCardAnchor>(anchor);
                cardAnchor.buildingId = building.name;
                cardAnchor.quickCardView = null;

                RemoveChildIfExists(anchor.transform, MarkerName);

                manager.RegisterCard(cardAnchor);
            }

            var weatherDetails = FindOrCreateWeatherDetailsPanel(hudRoot.transform, weatherClient);
            weatherDetails.SetActive(false);

            var weatherWidgetGo = FindOrCreateObject(WeatherWidgetName, hudRoot.transform);
            var weatherWidget = GetOrAddComponent<WeatherHudWidget>(weatherWidgetGo);
            weatherWidget.weatherClient = weatherClient;
            weatherWidget.weatherHudTarget = weatherDetails;
            weatherWidget.startCollapsed = true;

            manager.HideQuickCard();
            if (resetSelectionAndHideDetail && detailView != null)
                detailView.Show(false);
            Debug.Log($"[CityverseBuildingUIInstaller] Installed/updated building hover UX for {manager.buildingCards.Count} buildings.");
        }

        private static void SetModeWithoutReset(CityverseBuildingUI.BuildingCardMode mode)
        {
            var manager = Object.FindFirstObjectByType<BuildingCardsManager>();
            if (manager == null)
            {
                InstallOrUpdateInScene(resetSelectionAndHideDetail: false);
                manager = Object.FindFirstObjectByType<BuildingCardsManager>();
            }

            if (manager != null)
                manager.SetMode(mode);
        }

        private static List<GameObject> FindAllBuildings()
        {
            var names = new[]
            {
                "villa-a",
                "villa-b",
                "apartment-01",
                "office-01",
                "retail-01",
                "utility-01",
                "factory-01",
                "school-01",
            };

            var result = new List<GameObject>();
            foreach (var name in names)
            {
                var go = GameObject.Find(name);
                if (go != null)
                    result.Add(go);
            }
            return result;
        }

        private static GameObject FindOrCreateHudRoot()
        {
            var hudRoot = GameObject.Find(HudRootName);
            if (hudRoot != null)
            {
                if (hudRoot.GetComponent<Canvas>() == null)
                    hudRoot.AddComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;
                if (hudRoot.GetComponent<CanvasScaler>() == null)
                    hudRoot.AddComponent<CanvasScaler>();
                if (hudRoot.GetComponent<GraphicRaycaster>() == null)
                    hudRoot.AddComponent<GraphicRaycaster>();
                return hudRoot;
            }

            hudRoot = new GameObject(HudRootName, typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = hudRoot.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.overrideSorting = true;
            canvas.sortingOrder = 400;

            var scaler = hudRoot.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            var rt = hudRoot.GetComponent<RectTransform>();
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
            return hudRoot;
        }

        private static GameObject FindOrCreateQuickCardAnchor(Transform building, string buildingId)
        {
            var targetName = buildingId + QuickCardSuffix;
            var existing = building.Find(targetName);
            if (existing != null)
                return existing.gameObject;

            var go = new GameObject(targetName, typeof(RectTransform));
            go.transform.SetParent(building, false);
            go.transform.localPosition = Vector3.zero;
            go.transform.localRotation = Quaternion.identity;
            go.transform.localScale = Vector3.one;
            return go;
        }

        private static GameObject FindOrCreateChild(Transform parent, string childName)
        {
            var existing = parent.Find(childName);
            if (existing != null)
                return existing.gameObject;

            var go = new GameObject(childName, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
        }

        private static void RemoveChildIfExists(Transform parent, string childName)
        {
            var existing = parent != null ? parent.Find(childName) : null;
            if (existing == null)
                return;

            if (Application.isPlaying)
                Object.Destroy(existing.gameObject);
            else
                Object.DestroyImmediate(existing.gameObject);
        }

        private static void RemoveAllExistingMarkers()
        {
            var markers = Object.FindObjectsByType<BuildingMarkerView>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (var marker in markers)
            {
                if (marker == null)
                    continue;

                if (Application.isPlaying)
                    Object.Destroy(marker.gameObject);
                else
                    Object.DestroyImmediate(marker.gameObject);
            }
        }

        private static GameObject FindOrCreateObject(string name, Transform parent)
        {
            var existing = GameObject.Find(name);
            if (existing != null)
            {
                if (existing.transform.parent != parent)
                    existing.transform.SetParent(parent, false);
                return existing;
            }

            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
        }

        private static GameObject FindOrCreateWeatherDetailsPanel(Transform hudRoot, WeatherApiClient weatherClient)
        {
            var panelGo = FindOrCreateObject(WeatherDetailsName, hudRoot);
            var panelImage = panelGo.GetComponent<Image>();
            if (panelImage == null)
                panelImage = panelGo.AddComponent<Image>();
            panelImage.color = CityverseBuildingUI.Theme.ExpertPanelFill;
            panelImage.raycastTarget = false;

            var panelRt = panelGo.GetComponent<RectTransform>();
            if (panelRt == null)
                panelRt = panelGo.AddComponent<RectTransform>();
            CityverseBuildingUI.Anchor(panelRt, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(420f, 260f), new Vector2(24f, -164f));

            var outline = panelGo.GetComponent<Outline>();
            if (outline == null)
                outline = panelGo.AddComponent<Outline>();
            outline.effectColor = CityverseBuildingUI.Theme.ExpertBorder;
            outline.effectDistance = new Vector2(1f, -1f);

            var controller = GetOrAddComponent<WeatherPanelController>(panelGo);
            controller.weatherClient = weatherClient;
            controller.conditionText = FindOrCreatePanelText(panelRt, "ConditionText", "Condition: --", 20f, new Vector2(18f, -18f));
            controller.temperatureText = FindOrCreatePanelText(panelRt, "TemperatureText", "Temperature: --", 18f, new Vector2(18f, -54f));
            controller.windText = FindOrCreatePanelText(panelRt, "WindText", "Wind: --", 18f, new Vector2(18f, -88f));
            controller.cloudText = FindOrCreatePanelText(panelRt, "CloudText", "Clouds: --", 18f, new Vector2(18f, -122f));
            controller.dayNightText = FindOrCreatePanelText(panelRt, "DayNightText", "Day/Night: --", 18f, new Vector2(18f, -156f));
            controller.seasonText = FindOrCreatePanelText(panelRt, "SeasonText", "Season: --", 18f, new Vector2(18f, -190f));
            controller.statusText = FindOrCreatePanelText(panelRt, "StatusText", "Waiting for weather data...", 14f, new Vector2(18f, -226f));

            return panelGo;
        }

        private static TMPro.TextMeshProUGUI FindOrCreatePanelText(RectTransform parent, string name, string defaultText, float fontSize, Vector2 anchoredPosition)
        {
            var existing = parent.Find(name);
            TMPro.TextMeshProUGUI text;
            if (existing != null)
            {
                text = existing.GetComponent<TMPro.TextMeshProUGUI>();
                if (text == null)
                    text = existing.gameObject.AddComponent<TMPro.TextMeshProUGUI>();
            }
            else
            {
                text = CityverseBuildingUI.AddText(name, parent, defaultText, fontSize, CityverseBuildingUI.Theme.ExpertTextSecondary, TMPro.FontStyles.Normal);
            }

            text.text = string.IsNullOrEmpty(text.text) ? defaultText : text.text;
            text.fontSize = fontSize;
            text.enableWordWrapping = false;
            text.raycastTarget = false;
            CityverseBuildingUI.Anchor(text.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, 1f), new Vector2(-36f, 28f), anchoredPosition);
            return text;
        }

        private static void DisableLegacyOverlay(GameObject building)
        {
            if (building == null)
                return;

            var legacy = building.GetComponent<BuildingOverlayBehaviour>();
            if (legacy != null)
                legacy.enabled = false;
        }

        private static void DisableLegacySelectionControllers()
        {
            var controllers = Object.FindObjectsByType<BuildingSelectionUIController>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (var controller in controllers)
            {
                if (controller == null)
                    continue;

                controller.defaultSelectedBuildingId = string.Empty;
                controller.showDetailPanelOnEnable = false;
                controller.enabled = false;
            }
        }

        private static void EnsureEventSystem()
        {
            if (Object.FindFirstObjectByType<EventSystem>() != null)
                return;

            var go = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            Object.DontDestroyOnLoad(go);
        }

        private static T GetOrAddComponent<T>(GameObject go) where T : Component
        {
            var component = go.GetComponent<T>();
            if (component == null)
                component = go.AddComponent<T>();
            return component;
        }
    }
}
