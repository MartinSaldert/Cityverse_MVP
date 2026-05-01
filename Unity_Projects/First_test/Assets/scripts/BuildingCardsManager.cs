using System.Collections.Generic;
using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Manages low-clutter building UX: a small marker on every building, one shared
    /// hover quick card, and one shared HUD detail panel for the selected building.
    /// </summary>
    public class BuildingCardsManager : MonoBehaviour
    {
        [Header("Data Source")]
        public BuildingsApiClient buildingsClient;

        [Header("Selection")]
        public string selectedBuildingId = string.Empty;
        public CityverseBuildingUI.BuildingCardMode mode = CityverseBuildingUI.BuildingCardMode.Expert;
        public bool showQuickCard = true;
        public bool hideQuickCardWhenNotHovering = true;

        [Header("Views")]
        public BuildingQuickCardView sharedQuickCardView;
        public BuildingDetailPanelView detailPanelView;
        public List<BuildingCardAnchor> buildingCards = new List<BuildingCardAnchor>();

        private readonly Dictionary<string, BuildingStateDto> _buildingsById = new Dictionary<string, BuildingStateDto>();
        private readonly Dictionary<string, BuildingCardAnchor> _cardsById = new Dictionary<string, BuildingCardAnchor>();
        private string _hoveredBuildingId;
        private bool _hasUserSelection;

        private void OnEnable()
        {
            RebuildCardMap();

            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated += HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError += HandleBuildingsError;

                if (buildingsClient.LatestBuildings != null)
                    HandleBuildingsUpdated(buildingsClient.LatestBuildings);
            }
            else
            {
                Debug.LogWarning("[BuildingCardsManager] buildingsClient is not assigned.");
            }
        }

        private void OnDisable()
        {
            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated -= HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError -= HandleBuildingsError;
            }
        }

        public bool IsSelected(string buildingId)
        {
            return Normalize(buildingId) == Normalize(selectedBuildingId);
        }

        public void ClearSelection()
        {
            selectedBuildingId = string.Empty;
            _hasUserSelection = false;
            if (detailPanelView != null)
                detailPanelView.Show(false);
        }

        public void SetMode(CityverseBuildingUI.BuildingCardMode newMode)
        {
            mode = newMode;

            if (sharedQuickCardView != null)
                sharedQuickCardView.mode = newMode;

            if (detailPanelView != null)
                detailPanelView.mode = newMode;

            RefreshAll();
        }

        public void SelectBuilding(string buildingId)
        {
            if (string.IsNullOrWhiteSpace(buildingId))
                return;

            selectedBuildingId = Normalize(buildingId);
            _hasUserSelection = true;
            RefreshAll();
            ShowQuickCardFor(selectedBuildingId);
        }

        public void RegisterCard(BuildingCardAnchor anchor)
        {
            if (anchor == null || string.IsNullOrWhiteSpace(anchor.buildingId))
                return;

            var normalized = Normalize(anchor.buildingId);
            _cardsById[normalized] = anchor;

            if (!buildingCards.Contains(anchor))
                buildingCards.Add(anchor);
        }

        public void ShowQuickCardFor(string buildingId)
        {
            if (string.IsNullOrWhiteSpace(buildingId))
                return;

            var normalized = Normalize(buildingId);
            _hoveredBuildingId = normalized;

            if (!_buildingsById.TryGetValue(normalized, out var dto) || dto == null)
                return;
            if (!_cardsById.TryGetValue(normalized, out var anchor) || anchor == null)
                return;
            if (sharedQuickCardView == null)
                return;

            sharedQuickCardView.mode = mode;
            sharedQuickCardView.Apply(CityverseBuildingUI.FromDto(dto, mode));
            sharedQuickCardView.transform.SetParent(anchor.transform.parent, false);
            sharedQuickCardView.transform.localPosition = sharedQuickCardView.localOffset;
            sharedQuickCardView.transform.localRotation = Quaternion.identity;
            sharedQuickCardView.gameObject.SetActive(showQuickCard);
        }

        public void HideQuickCard()
        {
            _hoveredBuildingId = null;
            if (!hideQuickCardWhenNotHovering)
                return;

            if (sharedQuickCardView != null)
                sharedQuickCardView.gameObject.SetActive(false);
        }

        private void HandleBuildingsUpdated(BuildingStateDto[] buildings)
        {
            _buildingsById.Clear();
            if (buildings != null)
            {
                foreach (var building in buildings)
                {
                    if (building == null || string.IsNullOrWhiteSpace(building.id))
                        continue;
                    _buildingsById[Normalize(building.id)] = building;
                }
            }

            RefreshAll();
        }

        private void RefreshAll()
        {
            foreach (var kvp in _cardsById)
            {
                if (!_buildingsById.TryGetValue(kvp.Key, out var dto) || dto == null)
                    continue;

                var anchor = kvp.Value;
                if (anchor == null)
                    continue;

                RemoveMarkers(anchor.transform);
            }

            RefreshDetail();

            // Keep quick card hover-driven when hideQuickCardWhenNotHovering is enabled.
            var quickTarget = !string.IsNullOrWhiteSpace(_hoveredBuildingId)
                ? _hoveredBuildingId
                : (hideQuickCardWhenNotHovering ? null : selectedBuildingId);

            if (!string.IsNullOrWhiteSpace(quickTarget))
                ShowQuickCardFor(quickTarget);
            else if (sharedQuickCardView != null)
                sharedQuickCardView.gameObject.SetActive(false);
        }

        private void RefreshDetail()
        {
            if (detailPanelView == null)
                return;

            if (!_hasUserSelection || string.IsNullOrWhiteSpace(selectedBuildingId))
            {
                detailPanelView.Show(false);
                return;
            }

            if (!_buildingsById.TryGetValue(Normalize(selectedBuildingId), out var dto) || dto == null)
            {
                detailPanelView.Show(false);
                return;
            }

            detailPanelView.mode = mode;
            detailPanelView.Apply(CityverseBuildingUI.FromDto(dto, mode));
            detailPanelView.Show(true);
        }

        private void RebuildCardMap()
        {
            _cardsById.Clear();
            for (int i = buildingCards.Count - 1; i >= 0; i--)
            {
                var anchor = buildingCards[i];
                if (anchor == null)
                {
                    buildingCards.RemoveAt(i);
                    continue;
                }

                RegisterCard(anchor);
            }
        }

        private void HandleBuildingsError(string message)
        {
            Debug.LogWarning($"[BuildingCardsManager] {message}");
        }

        private static void RemoveMarkers(Transform root)
        {
            if (root == null)
                return;

            var markers = root.GetComponentsInChildren<BuildingMarkerView>(true);
            foreach (var marker in markers)
            {
                if (marker == null)
                    continue;

                if (Application.isPlaying)
                    Destroy(marker.gameObject);
                else
                    DestroyImmediate(marker.gameObject);
            }
        }

        private static string Normalize(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();
        }
    }
}
