module Browse.Filter.Types exposing (..)

import Browse.Filter.Part.Types as PartTypes

type alias Model =
    { from : PartTypes.Model
    , to : PartTypes.Model
    }

type Msg
    = From PartTypes.Msg
    | To PartTypes.Msg
