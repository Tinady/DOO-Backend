import WorkflowTemplate from '../models/workflowTemplate.model.js';

import mongoose from 'mongoose'; // Assuming Mongoose for ObjectId validation

// Create new workflow template
export const createWorkflowTemplate = async (req, res) => {
  try {
    const { name, categoryId, subCategoryId, stages, requiredDocumentTemplates } = req.body;

    // Input validation (required fields)
    if (!name || !categoryId || !subCategoryId || !stages.length || !requiredDocumentTemplates.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }  

    // Validate category and subcategory IDs (assuming they are ObjectIds)
    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({ error: 'Invalid category or subcategory ID' });
    }

    // Validate stages
    stages.forEach(stage => {
      if (!stage.stageTitle || !['Single Person', 'Board'].includes(stage.approverType)) {
        throw new Error('Invalid stage data: Missing required properties or invalid approver type');
      }

      // Validate condition
      if (stage.hasCondition) {
        if (!stage.condition) {
          throw new Error('Condition required when hasCondition is true');
        }
        // Add validation for condition structure (if needed)
      } else {
        if (stage.condition || stage.conditionVariants?.length) {
          throw new Error('Condition and conditionVariants should be empty when hasCondition is false');
        }
      }

      // Validate condition variants (if present)
      if (stage.conditionVariants && stage.conditionVariants.length) {
        if (!stage.hasCondition) {
          throw new Error('conditionVariants require hasCondition to be true');
        }
        stage.conditionVariants.forEach(variant => {
          if (!variant.condition_name || !variant.operator || !variant.value || !(typeof variant.value === 'number' || typeof variant.value === 'string')) {
            throw new Error('Invalid condition variant: Missing required properties or invalid value format');
          }
        });
      }

      // Add validation for roles in permissions and specific condition types (if needed)
      // ... (your additional validation logic here)
    });

    const newTemplate = new WorkflowTemplate({
      name,
      categoryId,
      subCategoryId,
      stages,
      requiredDocumentTemplates
    });

    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (err) {
    console.error('Error creating workflow template:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all workflow templates
export async function getAllWorkflowTemplates(req, res) {
    try {
        const templates = await WorkflowTemplate.find();
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get a single workflow template by ID
export async function getWorkflowTemplateById(req, res) {
    try {
        const template = await WorkflowTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Workflow template not found' });
        }
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update a workflow template
export async function updateWorkflowTemplate(req, res) {
    try {
        const { name, stages } = req.body;
        await WorkflowTemplate.findByIdAndUpdate(req.params.id, { name, stages });
        res.json({ message: 'Workflow template updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Delete a workflow template
export async function deleteWorkflowTemplate(req, res) {
    try {
        await WorkflowTemplate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Workflow template deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export default {
    createWorkflowTemplate,
    getAllWorkflowTemplates,
    getWorkflowTemplateById,
    updateWorkflowTemplate,
    deleteWorkflowTemplate,
};
