module Browse.Filter.Types exposing (..)

import Browse.Filter.Part.Types as PartTypes

type alias Model =
    { from : PartTypes.Model
    , to : PartTypes.Model
    }

type Msg
    = From PartTypes.Msg
    | To PartTypes.Msg

type alias Filter =
    { from : List String
    , to : List String
    }

getFilter : Model -> Filter
getFilter model = Filter
    (PartTypes.filterList <| (.elements << .from) model)
    (PartTypes.filterList <| (.elements << .to) model)
