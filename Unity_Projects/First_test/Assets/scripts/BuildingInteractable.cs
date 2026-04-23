using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Lightweight interaction bridge attached to each building root.
    /// Uses classic mouse callbacks from the building collider to drive shared
    /// hover-card and click-to-HUD selection behavior.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class BuildingInteractable : MonoBehaviour
    {
        public string buildingId;
        public BuildingCardsManager cardsManager;

        private void Reset()
        {
            if (string.IsNullOrWhiteSpace(buildingId))
                buildingId = gameObject.name;
        }

        private void OnMouseEnter()
        {
            if (cardsManager == null)
                return;

            cardsManager.ShowQuickCardFor(buildingId);
        }

        private void OnMouseExit()
        {
            if (cardsManager == null)
                return;

            if (!cardsManager.IsSelected(buildingId))
                cardsManager.HideQuickCard();
        }

        private void OnMouseDown()
        {
            if (cardsManager == null)
                return;

            cardsManager.SelectBuilding(buildingId);
            cardsManager.ShowQuickCardFor(buildingId);
        }
    }
}
