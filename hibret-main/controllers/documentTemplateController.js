import DocumentTemplate from '../models/documentTemplate.model.js';
import mongoose from 'mongoose';

// Create a new document template
export async function createDocumentTemplate(req, res) {
        try {
            const { name, description, subCategoryId, sections, conditionLogic } = req.body;
    
            // Check if sections have conditional logic and add them to eligibleConditions array
            const eligibleConditions = sections
                .filter(section => section.conditionalLogic)
                .map(section => ({
                    fieldName: section.sectionHeader,
                    dataType: section.sectionDataType
                }));
    
            const newTemplate = new DocumentTemplate({
                name,
                description,
                subCategoryId,
                sections,
                conditionLogic,
                eligibleConditions
            });
    
            await newTemplate.save();
            return res.status(201).json(newTemplate);
        } catch (err) {
            console.error('Error in createDocumentTemplate:', err);
            return res.status(400).json({ message: 'Failed to create document template.' });
        }
    }


// Get all document templates
export async function getAllDocumentTemplates(req, res) {
    try {
        const templates = await DocumentTemplate.find().populate('subCategoryId'); // Populate subcategory details (optional)
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get a single document template by ID
export async function getDocumentTemplateById(req, res) {
    try {
        const template = await DocumentTemplate.findById(req.params.id).populate('subCategoryId'); // Populate subcategory details (optional)
        if (!template) {
            return res.status(404).json({ message: 'Document template not found' });
        }
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update a document template
export async function updateDocumentTemplate(req, res) {
    try {
        const { name, description, subCategoryId, sections } = req.body;

        const updatedTemplate = await DocumentTemplate.findByIdAndUpdate(
            req.params.id,
            { name, description, subCategoryId, sections, conditionalLogic },
            { new: true } // Return the updated document
        );

        if (!updatedTemplate) {
            return res.status(404).json({ message: 'Document template not found' });
        }

        res.json(updatedTemplate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Delete a document template
export async function deleteDocumentTemplate(req, res) {
    try {
        await DocumentTemplate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document template deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function getDocumentBySub(req, res) {
    const subcategoryId= req.params;
    try{
    const templates = await DocumentTemplate.find({ subCategoryId: subcategoryId.id});
    return res.status(200).json({ templates});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
}

export async function getConditionsByTemp(req, res) {
    try {

        const { templateIds } = req.body; // Assuming templateIds is an array of template IDs passed in the request body
        if (!Array.isArray(templateIds) || templateIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid template IDs provided.' });
        }
        
    // Query database to fetch document templates based on provided template IDs
    const documentTemplates = await DocumentTemplate.find({ _id: { $in: templateIds } }).populate('eligibleConditions');

    // Map over document templates to format the data
    const formattedTemplates = documentTemplates.map(template => ({
        _id: template._id,
        name: template.name,
        eligibleConditions: template.eligibleConditions.map(condition => ({
            fieldName: condition.fieldName,
            dataType: condition.dataType
        }))
    }));

   // return formattedTemplates;
      return res.status(200).json({ formattedTemplates});
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error for handling
    }
  }
//         // Query database to fetch document templates based on provided template IDs
//         const documentTemplates = await DocumentTemplate.find({ _id: { $in: templateIds } }).populate('eligibleConditions');

//         // Map over document templates to format the data
//         const formattedTemplates = documentTemplates.map(template => ({
//             _id: template._id,
//             name: template.name,
//             description: template.description,
//             eligibleConditions: template.eligibleConditions.map(condition => ({
//                 fieldName: condition.fieldName,
//                 dataType: condition.dataType
//             }))
//         }));

//         return formattedTemplates;
//     } catch (error) {
//         // Handle error
//         throw new Error('Failed to fetch eligible conditions for document templates');
//     }
// }

async function createIndexes() {
    try {
        await DocumentTemplate.collection.createIndex({ eligibleConditions: 1 }); // 1 for ascending index
        console.log('Index created for eligibleConditions field.');
        await DocumentTemplate.collection.createIndex({ _id: 1 }); // 1 for ascending index
        console.log('Index created for _id field.');
    } catch (error) {
        console.error('Failed to create index for eligibleConditions field:', error);
    }
}

// Call the function to create indexes
createIndexes();

export default {
    createDocumentTemplate,
    getAllDocumentTemplates,
    getDocumentTemplateById,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    getDocumentBySub,
    getConditionsByTemp
};
