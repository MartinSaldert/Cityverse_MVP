using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Attach to a building GameObject.  Set buildingId in the Inspector to the
    /// stable building ID (e.g. "villa-a").  Wire the buildingsClient reference to
    /// the single BuildingsApiClient in the scene.
    ///
    /// At runtime this creates a child TextMesh that floats above the building and
    /// displays label, people count, and current load each poll cycle.
    /// Uses built-in Legacy TextMesh — no extra packages required.
    /// </summary>
    public class BuildingOverlayBehaviour : MonoBehaviour
    {
        [Header("Building Identity")]
        [Tooltip("Stable building ID matching the VC roster, e.g. \"villa-a\"")]
        public string buildingId;

        [Tooltip("Shared client — drag the BuildingsReceiver GameObject here")]
        public BuildingsApiClient buildingsClient;

        [Header("Overlay Settings")]
        [Tooltip("Height above the GameObject pivot where the label appears")]
        public float verticalOffset = 3f;

        [Tooltip("Rotate the label to face the main camera each frame")]
        public bool lookAtCamera = true;

        [Tooltip("Font size for the world-space TextMesh")]
        public int fontSize = 24;

        public Color textColor = Color.white;

        private TextMesh _textMesh;
        private Transform _labelTransform;

        private void Awake()
        {
            var child = new GameObject("BuildingOverlay_" + buildingId);
            child.transform.SetParent(transform, worldPositionStays: false);
            child.transform.localPosition = new Vector3(0f, verticalOffset, 0f);

            float scale = buildingsClient != null ? buildingsClient.overlayTextScale : 0.1f;
            child.transform.localScale = Vector3.one * scale;

            _textMesh = child.AddComponent<TextMesh>();
            _textMesh.fontSize = fontSize;
            _textMesh.color = textColor;
            _textMesh.anchor = TextAnchor.MiddleCenter;
            _textMesh.alignment = TextAlignment.Center;
            _textMesh.text = buildingId;

            _labelTransform = child.transform;
        }

        private void OnEnable()
        {
            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated += HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError   += HandleBuildingsError;

                // Populate immediately if the client already has data
                if (buildingsClient.LatestBuildings != null)
                    HandleBuildingsUpdated(buildingsClient.LatestBuildings);
            }
            else
            {
                Debug.LogWarning($"[BuildingOverlay:{buildingId}] buildingsClient is not assigned.");
            }
        }

        private void OnDisable()
        {
            if (buildingsClient != null)
            {
                buildingsClient.OnBuildingsUpdated -= HandleBuildingsUpdated;
                buildingsClient.OnBuildingsError   -= HandleBuildingsError;
            }
        }

        private void LateUpdate()
        {
            if (!lookAtCamera || _labelTransform == null) return;
            var cam = Camera.main;
            if (cam == null) return;
            _labelTransform.rotation = Quaternion.LookRotation(
                _labelTransform.position - cam.transform.position
            );
        }

        private void HandleBuildingsUpdated(BuildingStateDto[] buildings)
        {
            foreach (var b in buildings)
            {
                if (b.id != buildingId) continue;
                _textMesh.text = FormatOverlay(b);
                return;
            }
            // ID not found in current list — show a placeholder rather than stale data
            _textMesh.text = $"{buildingId}\n(no data)";
        }

        private void HandleBuildingsError(string message)
        {
            Debug.LogWarning($"[BuildingOverlay:{buildingId}] {message}");
        }

        private static string FormatOverlay(BuildingStateDto b)
        {
            return $"{b.label}\nPeople: {b.occupancyCount}\nLoad: {b.currentDemandKw:F1} kW";
        }
    }
}
