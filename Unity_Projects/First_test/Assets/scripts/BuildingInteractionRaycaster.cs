using UnityEngine;
using UnityEngine.EventSystems;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace Cityverse.Receiver
{
    /// <summary>
    /// Input-system-agnostic world hover/click raycaster for building interactions.
    /// Avoids reliance on OnMouse* callbacks.
    /// </summary>
    public class BuildingInteractionRaycaster : MonoBehaviour
    {
        public Camera targetCamera;
        public LayerMask layerMask = Physics.DefaultRaycastLayers;
        public float maxDistance = 5000f;

        private BuildingInteractable _hovered;

        private void Awake()
        {
            if (targetCamera == null)
                targetCamera = Camera.main;
        }

        private void Update()
        {
            if (targetCamera == null)
                targetCamera = Camera.main;
            if (targetCamera == null)
                return;

            var mousePos = ReadMousePosition(out var hasMouse);
            if (!hasMouse)
                return;

            if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject())
            {
                if (_hovered != null)
                {
                    _hovered.HandleHoverExit();
                    _hovered = null;
                }
                return;
            }

            var ray = targetCamera.ScreenPointToRay(mousePos);
            BuildingInteractable hitInteractable = null;

            if (Physics.Raycast(ray, out var hit, maxDistance, layerMask, QueryTriggerInteraction.Collide))
                hitInteractable = hit.collider != null ? hit.collider.GetComponentInParent<BuildingInteractable>() : null;

            if (_hovered != hitInteractable)
            {
                if (_hovered != null)
                    _hovered.HandleHoverExit();

                _hovered = hitInteractable;

                if (_hovered != null)
                    _hovered.HandleHoverEnter();
            }

            if (_hovered != null && ReadLeftMouseDown())
                _hovered.HandleClick();
        }

        private static Vector3 ReadMousePosition(out bool hasMouse)
        {
#if ENABLE_INPUT_SYSTEM
            if (Mouse.current != null)
            {
                hasMouse = true;
                var p = Mouse.current.position.ReadValue();
                return new Vector3(p.x, p.y, 0f);
            }
#endif
            hasMouse = true;
            return Input.mousePosition;
        }

        private static bool ReadLeftMouseDown()
        {
#if ENABLE_INPUT_SYSTEM
            if (Mouse.current != null)
                return Mouse.current.leftButton.wasPressedThisFrame;
#endif
            return Input.GetMouseButtonDown(0);
        }
    }
}
