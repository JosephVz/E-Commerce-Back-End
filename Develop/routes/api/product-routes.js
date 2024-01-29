const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error Products not found.'});
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    !product
    ? res.status(404).json({ message: 'Error Product not found.'})
    : res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error Product not found.'});
  }
});

// create new product
router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIds = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIds);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      res.status(400).json({ message: "Creation failed", error: err });
    });
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  try {
    await Product.update(req.body, { where: { id: req.params.id } });

    // Check if req.body.tags exists and has some length
    if (req.body.tags && req.body.tags.length > 0) {
      // Retrieve product tags and their IDs
      const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      // Filter new product tags and create new ones
      const newProductTags = req.body.tags
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // Filter product tags to remove and delete them
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tags.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    // Respond with updated product
    const product = await Product.findByPk(req.params.id, { include: [{ model: Tag }] });
    return res.json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    !deleted
      ? res.status(404).json({ message: 'Error Id not found.' })
      : res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ message: 'Error Product not deleted.' });
  }
});

module.exports = router;
