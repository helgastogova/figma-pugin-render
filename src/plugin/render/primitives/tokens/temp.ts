/* 
  Scopes allow a variable to be shown/hidden in the variable picker UI for various fields. This is useful to help declutter the Figma UI if you have a large number of variables. Currently only supported on FLOAT and COLOR variables.
  ALL_SCOPES is a special scope that means that the variable will be shown in the picker UI for all current and any future fields. If ALL_SCOPES is set, no additional scopes can be set.
  Likewise, ALL_FILLS is a special scope that means that the variable will be shown in the picker UI for all current and any future color fill fields. If ALL_FILLS is set, no additional fill scopes can be set.
  Valid scopes for FLOAT variables are: ALL_SCOPES, TEXT_CONTENT, WIDTH_HEIGHT, GAP, STROKE_FLOAT, OPACITY, and EFFECT_FLOAT.
  Valid scopes for COLOR variables are ALL_SCOPES, ALL_FILLS, FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR, and EFFECT_COLOR.
  
  'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'
  
  'ALL_SCOPES'
  'TEXT_CONTENT'
  'CORNER_RADIUS'
  'WIDTH_HEIGHT'
  'GAP'
  'ALL_FILLS'
  'FRAME_FILL'
  'SHAPE_FILL'
  'TEXT_FILL'
  'STROKE_COLOR'
  'STROKE_FLOAT'
  'EFFECT_FLOAT'
  'EFFECT_COLOR'
  'OPACITY'
  
  'COLOR' scopes:
  'ALL_SCOPES'
  'ALL_FILLS'
  'FRAME_FILL'
  'SHAPE_FILL'
  'TEXT_FILL'
  'STROKE_COLOR'
  'EFFECT_COLOR'
  
  'FLOAT' scopes:
  'ALL_SCOPES'
  'TEXT_CONTENT'
  'WIDTH_HEIGHT'
  'GAP'
  'STROKE_FLOAT'
  'OPACITY'
  'EFFECT_FLOAT'
  
  'BOOLEAN' scopes:
  'ALL_SCOPES'
  'TEXT_CONTENT'
  'WIDTH_HEIGHT'
  'GAP'
  'STROKE_FLOAT'
  'OPACITY'
  'EFFECT_FLOAT'
  
  'STRING' scopes:
  'ALL_SCOPES'
  'TEXT_CONTENT'
  'WIDTH_HEIGHT'
  'GAP'
  'STROKE_FLOAT'
  'OPACITY'
  'EFFECT_FLOAT'
  ----
  
  'ALL_SCOPES' – All
  'ALL_FILLS' – All fills
  'FRAME_FILL' – Fill: Frame
  'SHAPE_FILL' – Fill: Shape
  'TEXT_FILL' – Fill: Text
  'STROKE_COLOR' – Stroke
  'EFFECT_COLOR' – Effecs
  
  type Effect = DropShadowEffect | InnerShadowEffect | BlurEffect
  
  */
