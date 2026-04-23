using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Bridges BuildingsApiClient data into the new Canvas building UI.
    /// Intended as the first hybrid step: code-generated UI now, prefabs later if desired.
    ///
    /// Usage:
    /// - Add one instance to a HUD/controller GameObject.
    /// - Assign buildingsClient.
    /// - Assign quickCardView and detailPanelView.
    /// - Call SelectBuilding("office-01") from another script, or set defaultSelectedBuildingId.
    /// </summary>
    public class BuildingSelectionUIController : MonoBehaviour
    {
        [Header("Data Source")]
        public BuildingsApiClient buildingsClient;

        [Header("Views")]
        public BuildingQuickCardView quickCardView;
        public BuildingDetailPanelView detailPanelView;

        [Header("Selection")]
        public string defaultSelectedBuildingId = "factory-01";
        public bool showDetailPanelOnEnable = true;
        public CityverseBuildingUI.BuildingCardMode mode = CityverseBuildingUI.BuildingCardMode.Expert;
        public bool selectByAttachedOverlayIfAvailable = true;

        private readonly Dictionary<string, BuildingStateDto> _buildingsById = new Dictionary<string, BuildingStateDto>();
        private string _selectedBuildingId;

        private void OnEnable()
        {
            _selectedBuildingId = string.IsNullOrWhiteSpace(defaultSelectedBuildingId) ? _selectedBuildingId : defaultSelectedBuildingId;

            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated += HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError += HandleBuildingsError;

                if (buildingsClient.LatestBuildings != null)
                    HandleBuildingsUpdated(buildingsClient.LatestBuildings);
            }
            else
            {
                Debug.LogWarning("[BuildingSelectionUIController] buildingsClient is not assigned.");
            }

            if (detailPanelView != null)
                detailPanelView.Show(showDetailPanelOnEnable);
        }

        private void OnDisable()
        {
            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated -= HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError -= HandleBuildingsError;
            }
        }

        public void SelectBuilding(string buildingId, Transform worldAnchor = null)
        {
            if (string.IsNullOrWhiteSpace(buildingId))
                return;

            _selectedBuildingId = NormalizeBuildingId(buildingId);

            if (worldAnchor == null && selectByAttachedOverlayIfAvailable)
                worldAnchor = FindAnchorForBuilding(_selectedBuildingId);

            if (worldAnchor != null && quickCardView != null)
            {
                quickCardView.transform.SetParent(worldAnchor, false);
                quickCardView.transform.localPosition = quickCardView.localOffset;
                quickCardView.transform.localRotation = Quaternion.identity;
            }

            RefreshSelected();
        }

        public void SetMode(CityverseBuildingUI.BuildingCardMode newMode)
        {
            mode = newMode;
            if (quickCardView != null)
                quickCardView.mode = newMode;
            if (detailPanelView != null)
                detailPanelView.mode = newMode;
            RefreshSelected();
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

                    _buildingsById[NormalizeBuildingId(building.id)] = building;
                }
            }

            if (string.IsNullOrWhiteSpace(_selectedBuildingId) && buildings != null && buildings.Length > 0)
                _selectedBuildingId = NormalizeBuildingId(buildings[0].id);

            RefreshSelected();
        }

        private void RefreshSelected()
        {
            if (string.IsNullOrWhiteSpace(_selectedBuildingId))
                return;

            if (!_buildingsById.TryGetValue(_selectedBuildingId, out var dto) || dto == null)
            {
                var fallback = _buildingsById.Values.FirstOrDefault();
                if (fallback == null)
                    return;

                _selectedBuildingId = NormalizeBuildingId(fallback.id);
                dto = fallback;
            }

            var vm = CityverseBuildingUI.FromDto(dto, mode);

            if (quickCardView != null)
                quickCardView.Apply(vm);

            if (detailPanelView != null)
            {
                detailPanelView.mode = mode;
                detailPanelView.Apply(vm);
                detailPanelView.Show(showDetailPanelOnEnable);
            }

            Debug.Log($"[BuildingSelectionUIController] Live data bound for '{dto.id}' demand={dto.currentDemandKw:F1} base={dto.baseDemandKw:F1} occ={dto.occupancyCount}/{dto.occupancyCapacity} weather={dto.weatherFactor:F2} updated={dto.updatedAt}");
        }

        private static string NormalizeBuildingId(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : value.Trim().ToLowerInvariant();
        }

        private static Transform FindAnchorForBuilding(string buildingId)
        {
            if (string.IsNullOrWhiteSpace(buildingId))
                return null;

            var go = GameObject.Find(buildingId);
            return go != null ? go.transform : null;
        }

        private void HandleBuildingsError(string message)
        {
            Debug.LogWarning($"[BuildingSelectionUIController] {message}");
        }
    }
}
