module Browse.Types exposing (..)

import Browse.Bids.Types
import Browse.Filter.Types
import Error.Types

type alias Model =
    { bids : Browse.Bids.Types.Model
    , filter : Browse.Filter.Types.Model
    , error : Error.Types.Model
    }

type Msg
    = Bids Browse.Bids.Types.Msg
    | Filter Browse.Filter.Types.Msg
    | Error Error.Types.Msg
    | SetBids (List Browse.Bids.Types.Bid)
