using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Marker/binder placed on each building quick card instance.
    /// Keeps a stable building id on the world-space card so the installer and
    /// selection controller can rebuild and switch modes cleanly.
    /// </summary>
    public class BuildingCardAnchor : MonoBehaviour
    {
        public string buildingId;
        public BuildingQuickCardView quickCardView;

        public void Apply(CityverseBuildingUI.BuildingViewModel vm)
        {
            if (quickCardView == null)
                quickCardView = GetComponent<BuildingQuickCardView>();

            if (quickCardView != null)
                quickCardView.Apply(vm);
        }
    }
}
