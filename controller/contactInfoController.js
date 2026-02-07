const Contact = require("../model/contactModel.js");

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const createContact = async (req, res) => {
  try {
    const { emails, phoneNumbers } = req.body;

    const contact = new Contact({
      emails: emails || [],
      phoneNumbers: phoneNumbers || [],
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, phoneNumbers } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { emails, phoneNumbers },
      { new: true }, // return the updated document
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
};
