import Vehicle from '../models/Vehicle.js';

export const submitVehicle = async (req, res) => {
  try {
    const { title, description, price, type } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const newVehicle = new Vehicle({
      title,
      description,
      price: Number(price),
      type,
      image: imagePath,
      seller: req.userId,
      status: 'pending'
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while submitting the vehicle' });
  }
};

export const buyVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status === 'sold') {
      return res.status(400).json({ message: 'Vehicle is already sold.' });
    }

    // Mark as sold
    vehicle.status = 'sold';
    await vehicle.save();

    res.status(200).json({ message: 'Purchase successful', vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong buying vehicle' });
  }
};

export const getApprovedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'approved' }).populate('seller', 'name email');
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong fetching vehicles' });
  }
};

export const getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ seller: req.userId });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong fetching your requests' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('seller', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong fetching vehicle details' });
  }
};
