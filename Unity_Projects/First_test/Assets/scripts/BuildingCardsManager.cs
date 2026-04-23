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
        public string selectedBuildingId = "factory-01";
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

        public void SetMode(CityverseBuildingUI.BuildingCardMode newMode)
        {
            mode = newMode;

            foreach (var anchor in buildingCards)
            {
                if (anchor == null)
                    continue;

                var marker = anchor.GetComponentInChildren<BuildingMarkerView>(true);
                if (marker != null)
                    marker.mode = newMode;
            }

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

            if (sharedQuickCardView != null && !string.IsNullOrWhiteSpace(selectedBuildingId))
            {
                sharedQuickCardView.gameObject.SetActive(false);
            }
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

                var vm = CityverseBuildingUI.FromDto(dto, mode);
                var marker = anchor.GetComponentInChildren<BuildingMarkerView>(true);
                if (marker != null)
                {
                    marker.mode = mode;
                    marker.Apply(vm, selected: kvp.Key == Normalize(selectedBuildingId));
                }
            }

            RefreshDetail();

            var quickTarget = !string.IsNullOrWhiteSpace(_hoveredBuildingId) ? _hoveredBuildingId : selectedBuildingId;
            if (!string.IsNullOrWhiteSpace(quickTarget))
                ShowQuickCardFor(quickTarget);
        }

        private void RefreshDetail()
        {
            if (detailPanelView == null)
                return;

            if (string.IsNullOrWhiteSpace(selectedBuildingId) && _buildingsById.Count > 0)
            {
                foreach (var key in _buildingsById.Keys)
                {
                    selectedBuildingId = key;
                    break;
                }
            }

            if (string.IsNullOrWhiteSpace(selectedBuildingId))
                return;

            if (!_buildingsById.TryGetValue(Normalize(selectedBuildingId), out var dto) || dto == null)
                return;

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

        private static string Normalize(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();
        }
    }
}
