using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Lightweight interaction bridge attached to each building root.
    /// Supports both legacy OnMouse* and explicit raycast driver.
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

        public void HandleHoverEnter()
        {
            if (cardsManager == null)
                return;

            cardsManager.ShowQuickCardFor(buildingId);
        }

        public void HandleHoverExit()
        {
            if (cardsManager == null)
                return;

            if (!cardsManager.IsSelected(buildingId))
                cardsManager.HideQuickCard();
        }

        public void HandleClick()
        {
            if (cardsManager == null)
                return;

            cardsManager.SelectBuilding(buildingId);
            cardsManager.ShowQuickCardFor(buildingId);
        }

        private void OnMouseEnter() => HandleHoverEnter();
        private void OnMouseExit() => HandleHoverExit();
        private void OnMouseDown() => HandleClick();
    }
}
