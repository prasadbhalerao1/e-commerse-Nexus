import CMS from './CMS.model.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const getCMS = asyncHandler(async (req, res) => {
  let cms = await CMS.findOne({ key: 'homepage' }).populate('featuredProducts', 'name price slug images inventory');
  if (!cms) {
    cms = await CMS.create({
      key: 'homepage',
      heroBanner: {
        title: 'PROJECT NEXUS UPLINK',
        subtitle: 'Cybernetic augmentations and terminal rig supplies.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
        ctaText: 'INITIALIZE SYSTEM'
      },
      featuredProducts: []
    });
  }
  return res.status(200).json(
    new ApiResponse(200, { cms }, 'CMS settings fetched successfully')
  );
});

export const updateCMS = asyncHandler(async (req, res) => {
  const { heroBanner, featuredProducts } = req.body;
  
  let cms = await CMS.findOne({ key: 'homepage' });
  if (!cms) {
    cms = new CMS({ key: 'homepage' });
  }

  if (heroBanner) {
    cms.heroBanner = { ...cms.heroBanner, ...heroBanner };
  }

  if (featuredProducts) {
    cms.featuredProducts = featuredProducts;
  }

  await cms.save();

  const populated = await CMS.findById(cms._id).populate('featuredProducts', 'name price slug images inventory');

  return res.status(200).json(
    new ApiResponse(200, { cms: populated }, 'CMS settings updated successfully')
  );
});
