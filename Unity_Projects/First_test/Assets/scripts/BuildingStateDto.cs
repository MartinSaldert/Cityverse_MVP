using System;
using UnityEngine;

namespace Cityverse.Receiver
{
    [Serializable]
    public class BuildingStateDto
    {
        public string id;
        public string label;
        public string type;
        public string scheduleClass;
        public int occupancyCount;
        public int occupancyCapacity;
        public float currentDemandKw;
        public float baseDemandKw;
        public float occupancyFactor;
        public float weatherFactor;
        public string updatedAt;
    }

    [Serializable]
    internal class BuildingListApiResponse
    {
        public bool ok;
        public BuildingStateDto[] data;
    }
}
