module Browse.Accept.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Error.Types

type alias Model =
    { modal : Maybe Bid
    , processing : Bool
    , sseID : Int
    , mousePositions : List (Int, Int)
    }

type Msg
    -- Modal
    = DisplayModal Bid
    | CancelModal

    -- Accept bid
    | AcceptBid Bid
    | EndProcessingBid
    | AcceptFailure Error.Types.Msg

    -- Misc
    | GetSSEId Int
    | MouseMove Int Int
    | ToError Error.Types.Msg
    | Noop
