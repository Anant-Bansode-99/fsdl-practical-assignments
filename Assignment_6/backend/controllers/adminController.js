import Vehicle from '../models/Vehicle.js';

export const getAllVehicles = async (req, res) => {
  try {
    // Admin can see everything except what's actually 'sold'. Let them see approved/rejected/pending
    const vehicles = await Vehicle.find({ status: { $ne: 'sold' } }).populate('seller', 'name email');
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong fetching all requests' });
  }
};

export const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong updating vehicle status' });
  }
};
