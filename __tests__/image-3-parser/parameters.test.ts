import { createImageServiceRequest, imageServiceRequestToString, parseImageServiceRequest } from '../../src/image-3';

describe('IIIF Image API Parameters', () => {
  /// {scheme}://{server}{/prefix}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}

  describe('munch.emuseum.com examples', () => {
    // https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/0/default.jpg
    // https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/0/default.jpg
    // https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/90/default.jpg
    // https://munch.emuseum.com/apis/iiif/image/v2/17261/info.json

    test('full/max/0/default.jpg', () => {
      const parsed = parseImageServiceRequest(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/0/default.jpg',
        'apis/iiif/image/v2'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "17261",
          "originalPath": "/17261/full/max/0/default.jpg",
          "prefix": "apis/iiif/image/v2",
          "quality": "default",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "munch.emuseum.com",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": false,
            "upscaled": false,
          },
          "type": "image",
        }
      `);

      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/0/default.jpg'
      );
    });

    test('90,0,350,220/max/0/default.jpg', () => {
      const parsed = parseImageServiceRequest(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/0/default.jpg',
        'apis/iiif/image/v2'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "17261",
          "originalPath": "/17261/90,0,350,220/max/0/default.jpg",
          "prefix": "apis/iiif/image/v2",
          "quality": "default",
          "region": {
            "h": 220,
            "percent": false,
            "w": 350,
            "x": 90,
            "y": 0,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "munch.emuseum.com",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": false,
            "upscaled": false,
          },
          "type": "image",
        }
      `);

      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/0/default.jpg'
      );
    });
    test('90,0,350,220/max/90/default.jpg', () => {
      const parsed = parseImageServiceRequest(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/90/default.jpg',
        'apis/iiif/image/v2'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "17261",
          "originalPath": "/17261/90,0,350,220/max/90/default.jpg",
          "prefix": "apis/iiif/image/v2",
          "quality": "default",
          "region": {
            "h": 220,
            "percent": false,
            "w": 350,
            "x": 90,
            "y": 0,
          },
          "rotation": {
            "angle": 90,
          },
          "scheme": "https",
          "server": "munch.emuseum.com",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": false,
            "upscaled": false,
          },
          "type": "image",
        }
      `);

      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/90,0,350,220/max/90/default.jpg'
      );
    });
    test('info.json', () => {
      const parsed = parseImageServiceRequest(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/info.json',
        'apis/iiif/image/v2'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "identifier": "17261",
          "prefix": "apis/iiif/image/v2",
          "scheme": "https",
          "server": "munch.emuseum.com",
          "type": "info",
        }
      `);

      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://munch.emuseum.com/apis/iiif/image/v2/17261/info.json'
      );
    });
  });

  describe('V&A Documentation examples', () => {
    // https://framemark.vam.ac.uk/collections/2006AN7529/full/full/0/default.jpg
    test('Request an image at full size', () => {
      const parsed = parseImageServiceRequest(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/0/default.jpg'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "collections/2006AN7529",
          "originalPath": "collections/2006AN7529/full/full/0/default.jpg",
          "prefix": "",
          "quality": "default",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "framemark.vam.ac.uk",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": true,
            "upscaled": false,
          },
          "type": "image",
        }
      `);
      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/0/default.jpg'
      );
    });
    test('Request an image fixed at 600 by 400', () => {
      const parsed = parseImageServiceRequest(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/600,/0/default.jpg'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "collections/2006AN7529",
          "originalPath": "collections/2006AN7529/full/600,/0/default.jpg",
          "prefix": "",
          "quality": "default",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "framemark.vam.ac.uk",
          "size": {
            "confined": false,
            "max": false,
            "upscaled": false,
            "width": 600,
          },
          "type": "image",
        }
      `);
      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/600,/0/default.jpg'
      );
    });
    test('Request a 100 by 100 (retaining aspect ratio) thumbnail', () => {
      const parsed = parseImageServiceRequest(
        'https://framemark.vam.ac.uk/collections/2016JL5779/full/!100,/0/default.jpg'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "collections/2016JL5779",
          "originalPath": "collections/2016JL5779/full/!100,/0/default.jpg",
          "prefix": "",
          "quality": "default",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "framemark.vam.ac.uk",
          "size": {
            "confined": true,
            "max": false,
            "upscaled": false,
            "width": 100,
          },
          "type": "image",
        }
      `);
      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://framemark.vam.ac.uk/collections/2016JL5779/full/!100,/0/default.jpg'
      );
    });
    test('Request a greyscale version', () => {
      const parsed = parseImageServiceRequest(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/0/grey.jpg'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "collections/2006AN7529",
          "originalPath": "collections/2006AN7529/full/full/0/grey.jpg",
          "prefix": "",
          "quality": "grey",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 0,
          },
          "scheme": "https",
          "server": "framemark.vam.ac.uk",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": true,
            "upscaled": false,
          },
          "type": "image",
        }
      `);
      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/0/grey.jpg'
      );
    });
    test('Request a image rotated by 180 degrees', () => {
      const parsed = parseImageServiceRequest(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/180/default.jpg'
      );
      expect(parsed).toMatchInlineSnapshot(`
        {
          "format": "jpg",
          "identifier": "collections/2006AN7529",
          "originalPath": "collections/2006AN7529/full/full/180/default.jpg",
          "prefix": "",
          "quality": "default",
          "region": {
            "full": true,
          },
          "rotation": {
            "angle": 180,
          },
          "scheme": "https",
          "server": "framemark.vam.ac.uk",
          "size": {
            "confined": false,
            "max": true,
            "serialiseAsFull": true,
            "upscaled": false,
          },
          "type": "image",
        }
      `);
      expect(imageServiceRequestToString(parsed)).toEqual(
        'https://framemark.vam.ac.uk/collections/2006AN7529/full/full/180/default.jpg'
      );
    });
  });

  test('Creating requests', () => {
    const req = createImageServiceRequest({
      id: 'https://framemark.vam.ac.uk/collections/2006AN7529',
      profile: 'level0',
    });
    expect(req).toMatchInlineSnapshot(`
      {
        "format": "jpg",
        "identifier": "collections/2006AN7529",
        "originalPath": "",
        "prefix": "",
        "quality": "default",
        "region": {
          "full": true,
        },
        "rotation": {
          "angle": 0,
        },
        "scheme": "https",
        "server": "framemark.vam.ac.uk",
        "size": {
          "confined": false,
          "max": true,
          "upscaled": false,
        },
        "type": "image",
      }
    `);

    expect(imageServiceRequestToString(req)).toMatchInlineSnapshot(
      `"https://framemark.vam.ac.uk/collections/2006AN7529/full/max/0/default.jpg"`
    );
  });
});
