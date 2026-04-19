using System;

namespace Cityverse.Receiver
{
    [Serializable]
    public class EnergyStateDto
    {
        public float solarOutputKw;
        public float windOutputKw;
        public float totalRenewableKw;
        public string updatedAt;
    }

    [Serializable]
    internal class EnergyApiResponse
    {
        public bool ok;
        public EnergyStateDto data;
    }
}
