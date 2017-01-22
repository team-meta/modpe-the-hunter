const NAME = "The Hunter",
    NAME_CODE = "the_hunter",
    VERSION = "1.0",
    DEVELOPER = "Astro",
    LICENSE_TEXT = "The Hunter is licensed under the Apache License, Version 2 (Apache-2.0).";

let CONTEXT,
    DP,
    PATH,
    theme,
    icAppsBitmap,
    icBuildBitmap,
    icSortBitmap;

function gui() {
    CONTEXT.runOnUiThread({
        run() {
            try {
                let window = new me.astro.widget.Window(theme);
                window.addLayout(icAppsBitmap, new me.astro.widget.Layout(theme)
                        .addView(new me.astro.widget.TextView()
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("Installer")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView()
                            .setText("Install the addon")
                            .setTextSize(14)
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setText("Install")
                            .setEffect(() => {})
                            .show())
                        .addView(new me.astro.widget.TextView()
                            .setText("Enable the addon")
                            .setTextSize(14)
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setText("Enable")
                            .setEffect(() => {})
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setText("Close")
                            .setEffect(() => window.dismiss())
                            .show())
                        .show())
                    .addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_info_outline.png"), new me.astro.widget.Layout(theme)
                        .addView(new me.astro.widget.TextView()
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("Script Info")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView()
                            .setText(NAME + " " + VERSION + "\n\nName Code: " + NAME_CODE + "\nDeveleoper: " + DEVELOPER + "\n\n")
                            .setTextColor(me.astro.design.Color.GREY_DARK)
                            .show())
                        .addView(new me.astro.widget.TextView()
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("License")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView()
                            .setText(LICENSE_TEXT)
                            .setTextColor(me.astro.design.Color.GREY_DARK)
                            .show())

                        .addView(new me.astro.widget.Button(theme)
                            .setText("Close")
                            .setEffect(() => window.dismiss())
                            .show())
                        .show())
                    .setFocusable(true)
                    .show();
            } catch (e) {
                print(e);
            }
        }
    });
}

function onLibraryLoaded(name, nameCode, version) {
    if (nameCode === "me_astro_library") {
        CONTEXT = me.astro.getContext();
        DP = CONTEXT.getResources().getDisplayMetrics().density;
        PATH = me.astro.getPath();
        theme = new me.astro.design.Theme({
            primary: me.astro.design.Color.GREEN,
            primaryDark: me.astro.design.Color.GREEN_DARK,
            accent: me.astro.design.Color.GREEN_ACCENT
        });
        icAppsBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADAAQAAAAB6p1GqAAAAAnRSTlMAAHaTzTgAAAAtSURBVFjD7dQhAgAACAIx/v9pzBajaQuU6yTAqW33CoKAvxIEf4W/EgR/BY8GWTh7vSiC7tgAAAAASUVORK5CYII=");
        icBuildBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAQAAAD41aSMAAAFJElEQVR42u3dzWtUZxiG8WPix8aF/YgghRSEVjSdUxFc2eJWiwtFUGlFhKZk5U4QlEgg4EIQIStjcBdcqCtBmqxEohEhwiRYmNQPAhIISVo3QtNoe7loKG1qMl9n5p5nej//wXv9mGHOOe97Jkk8Ho/H4/F4PB6PpwZDKzs4yhn6uMUDxplkimmeM8EoQwzQzQn2sNGlsg7/MUe4wmN+o5T5gwLXOcU2l6s+fQe95PmTymaKfvbT6o6VpN/COZ6QxcxwmV0uWk783QyySLYzymFa3LaU/O3MUZt5RhdrXbg4Qa5mBFDgoAtrCWCE1I21BIv0sM6VlQQwzk5X1hIs8L0rawlggA3urCV4RJs7awkKtLvzagRpzQlest2dtQRzJtB/CvxFJCaYZLM7awkest6dtQT9rqwm6HRlLcECHa6sJRjzY5viBPM1JTjvxlqCRV+WqQmGXFhNcMCFtQST3tKlJvi2ORK1hyV4wpr4+XczSy4swaH4AIMQmOBu9PxblvZ41p7gyxoRfBYb4NzfC4lKcDE2wD83mMckmAm8p5ovli0mJsFXcQF6/7OYiASX4gLk37OceAQvouZvW+Fs11w4gq0xAY6ssgcnFsHJmABXVt0GlQsEcC0mwOMiO9FyYb6CChHzt7JQdDNgLkR+eBtwCzs7StqPmQuQHwh4poyjJW6JzQXID8fiAZwpeVdyruHzw9l4AH1lbAxPGzw/9MUDuFXW3vy0ofPDjXgAD8o8HpE2cH64Fw9gvOwTKmnD5oexeACTFRwSShs0P0zEA5iq6JxW2pD5I14LM13hUbm0AfPD03gAzys+rZg2XH7IxwOYqOLAaNpg+eF+PIDRKpZbAkFd88NwPIChqhY8vzpBnfPDYDyAgSqXvApB3fPDhXgA3VUvegUCQX7oigdwIoNlv4dAkh/2xQPYk8nClxGI8sMn8QA2VvzC4RUJZPlnk4hDIaPlLxHI8kf8EZokScL1zALMkwrzQ29MgFMZJpgX5oe9MQG20RzzOuwrbCq6Jd14cyeJOvQ3BUDc19ewvwny/84HcQFamQkPcDuJPFwOD3A1NsCuJvgS6olNMGoCLcDhpvglFJeAFp6ZQEvQ1SRXxFEJWJvZfVETVEhwEEygJRgxgRYgzfyvCU1QJkEPmEAJsK7sEwMmyJhgZ9GTwyaoMUEnmEBLMGACLcAGHplAS9DWNNfFYQnaeWkCLcH2mv8PjAmKEvhTICb4lJ9NoCXYzEMTaAnWc9UEaoQffINCTdDBmAnUDy3P+3mB/ofpkAnUCAcqeMmNCTIlaOU7fjKBFmENh7hrAjXD51zMZHP7IrdlVxuxCZKEFr7mEi8qXP5r7tD51/EK2ZaA6ARLEFs5yTUKvC1p0bMM08vefx+tM0E2z9NSjnGWPm5wjzEmKPCUPPcZZpALdLFv5ZcKmEAPaAITmMAEJjCBCUxgAhOYwAQmMIEJTGACE5jABCYwgQlMYAITmMAEJjCBCUxgAhOYwAQmMIEJTGACE5jABCYwgQlMYAITmMAEJjCBCUxgAhP8bwm63V5NcNzttQS/sMnttQSnXV5LMOLuWoJXrq4leOPmWoJpF9cS3HRvLcE3rq0k+NGllQR5PnRnHUGej9xYR+D8UgLnlxI4v5TA+aUEzi8lcH4pgfNLCZxfSuD8UgLnlxI4v5TA+aUEzi8lcH4pgfNLCZxfSuD8dSLodn41wXF+Xf6o3c9660uwidOM8Io3THPTG008Ho/H4/F4PB5PufMOnPz04SSwqfgAAAAASUVORK5CYII=");
        icSortBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADAAQAAAAB6p1GqAAAAAnRSTlMAAHaTzTgAAAAtSURBVHgB7dOxCQAgAANB919aB7AOIXDXfv1nCMD9NIMA6c+FfoDc50I/AOx4730931NAAwQAAAAASUVORK5CYII=");
        CONTEXT.runOnUiThread({
            run() {
                me.astro.getWindow().addView(new me.astro.widget.ImageButton(me.astro.design.Shape.CIRCLE, theme)
                    .setEffect(gui)
                    .setEffectImage(me.astro.design.Bitmap.resizeBitmap(icAppsBitmap, DP * 24, DP * 24))
                    .setImage(me.astro.design.Bitmap.resizeBitmap(icAppsBitmap, DP * 24, DP * 24))
                    .show())
            }
        });
    }
}