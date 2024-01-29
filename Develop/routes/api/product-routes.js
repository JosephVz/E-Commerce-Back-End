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
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: 'Error Post failed.'});
    });
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    !product
      ? res.status(404).json({ message: "Error not found!" })
      : res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error not found!" });
  }
});

// Create a new product
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
      res.status(400).json({ message: "Error Creation failed", error: err });
    });
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
