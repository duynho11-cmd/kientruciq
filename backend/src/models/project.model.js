import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true, maxlength: 2000 },
  publicId: { type: String, default: null },
  thumbnailUrl: { type: String, default: null },
  alt: { type: String, default: '', maxlength: 200 },
  caption: { type: String, default: '', maxlength: 500 },
  room: { type: String, default: null, maxlength: 100 },
  sortOrder: { type: Number, default: 0 },
  width: { type: Number, min: 1 },
  height: { type: Number, min: 1 },
}, { _id: true })

const contentBlockSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['paragraph', 'heading', 'quote', 'image'] },
  text: { type: String, default: '', maxlength: 10000 },
  level: { type: Number, enum: [2, 3], default: 2 },
  image: { type: imageSchema, default: null },
  imageSize: { type: String, enum: ['small', 'medium', 'large', 'full'], default: 'large' },
  imageAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
}, { _id: true })

const projectFileSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true, maxlength: 2000 },
  publicId: { type: String, default: null, trim: true, maxlength: 500 },
  name: { type: String, required: true, trim: true, maxlength: 255 },
  size: { type: Number, required: true, min: 1 },
}, { _id: false })

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['kien-truc', 'noi-that'],
    index: true,
  },
  summary: { type: String, default: '', trim: true, maxlength: 500 },
  description: { type: String, default: '', maxlength: 50000 },
  content: { type: [contentBlockSchema], default: [] },
  location: {
    province: { type: String, default: '', maxlength: 100 },
    district: { type: String, default: '', maxlength: 100 },
    address: { type: String, default: '', maxlength: 300 },
    country: { type: String, default: 'Việt Nam', maxlength: 100 },
  },
  projectYear: { type: Number, min: 1900, max: 2200 },
  completionYear: { type: Number, min: 1900, max: 2200 },
  client: { type: String, default: '', maxlength: 200 },
  architect: { type: String, default: '', maxlength: 200 },
  designTeam: { type: [String], default: [] },
  contractor: { type: String, default: '', maxlength: 200 },
  architectureDetails: {
    landArea: { type: Number, min: 0 },
    constructionArea: { type: Number, min: 0 },
    grossFloorArea: { type: Number, min: 0 },
    floors: { type: Number, min: 0, max: 200 },
    bedrooms: { type: Number, min: 0, max: 1000 },
    bathrooms: { type: Number, min: 0, max: 1000 },
    buildingType: { type: String, default: '', maxlength: 100 },
    architecturalStyle: { type: [String], default: [] },
    structure: { type: String, default: '', maxlength: 500 },
    facadeMaterials: { type: [String], default: [] },
    sustainabilityFeatures: { type: [String], default: [] },
  },
  interiorDetails: {
    propertyType: { type: String, default: '', maxlength: 100 },
    interiorArea: { type: Number, min: 0 },
    rooms: { type: [String], default: [] },
    interiorStyle: { type: [String], default: [] },
    primaryMaterials: { type: [String], default: [] },
    colorPalette: { type: [String], default: [] },
    furnitureBrands: { type: [String], default: [] },
    lightingConcept: { type: String, default: '', maxlength: 1000 },
    customFurniture: { type: Boolean, default: false },
  },
  coverImage: { type: imageSchema, default: null },
  gallery: { type: [imageSchema], default: [] },
  zipFile: { type: projectFileSchema, default: null },
  tags: { type: [String], default: [] },
  styles: { type: [String], default: [] },
  spaces: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  featured: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date, default: null },
  seo: {
    metaTitle: { type: String, default: '', maxlength: 70 },
    metaDescription: { type: String, default: '', maxlength: 200 },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: '', maxlength: 2000 },
    noIndex: { type: Boolean, default: false },
    ogTitle: { type: String, default: '', maxlength: 100 },
    ogDescription: { type: String, default: '', maxlength: 300 },
    ogImage: { type: String, default: '', maxlength: 2000 },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  viewCount: { type: Number, default: 0, min: 0 },
  sortOrder: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null, index: true },
}, {
  timestamps: true,
  optimisticConcurrency: true,
})

projectSchema.index({ category: 1, status: 1, publishedAt: -1 })
projectSchema.index({ featured: 1, sortOrder: 1 })
projectSchema.index({ title: 'text', summary: 'text', tags: 'text' })

export default mongoose.model('projects', projectSchema)
