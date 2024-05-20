import mongoose from 'mongoose';

// Define the document schema
const documentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate'
  },
  title: {
    type: String,
    // required: true
  },

  sections: [
    {
      title: {
        type: String,
        required: true,
      },
      // Object to store key-value pairs for content within a section
      content: {
        type: Object,
        required: true,
      },
    },
  ],

  filePath: [{
    type: String,
    required: false // This field is required for documents created through uploading
  }],

  creationDate: {
    type: Date,
    default: Date.now
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: false
  },

  versions: [{
    versionNumber: String,
    filePath: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  },
 
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  acl: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    permissions: [String]
  }]
});

// Create the Document model
const Document = mongoose.model('Document', documentSchema);

export default  Document;
