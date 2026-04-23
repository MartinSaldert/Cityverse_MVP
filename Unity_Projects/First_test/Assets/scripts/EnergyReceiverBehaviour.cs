using UnityEngine;

namespace Cityverse.Receiver
{
    [RequireComponent(typeof(EnergyApiClient))]
    public class EnergyReceiverBehaviour : MonoBehaviour
    {
        [Header("Live Energy State")]
        [SerializeField] private float solarOutputKw;
        [SerializeField] private float windOutputKw;
        [SerializeField] private float totalRenewableKw;
        [SerializeField] private string updatedAt;

        private EnergyApiClient _client;

        private void Awake()
        {
            _client = GetComponent<EnergyApiClient>();
        }

        private void OnEnable()
        {
            _client.OnEnergyUpdated += HandleEnergyUpdate;
            _client.OnEnergyError += HandleEnergyError;
        }

        private void OnDisable()
        {
            _client.OnEnergyUpdated -= HandleEnergyUpdate;
            _client.OnEnergyError -= HandleEnergyError;
        }

        private void HandleEnergyUpdate(EnergyStateDto dto)
        {
            solarOutputKw = dto.solarOutputKw;
            windOutputKw = dto.windOutputKw;
            totalRenewableKw = dto.totalRenewableKw;
            updatedAt = dto.updatedAt;

            Debug.Log($"[Energy] {dto.updatedAt} | Solar {dto.solarOutputKw:F1} kW | Wind {dto.windOutputKw:F1} kW | Total {dto.totalRenewableKw:F1} kW");
        }

        private void HandleEnergyError(string message)
        {
            Debug.LogWarning(message);
        }
    }
}
