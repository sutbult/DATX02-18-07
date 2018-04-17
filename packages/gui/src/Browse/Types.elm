module Browse.Types exposing (..)

import BidList.Table.Types as TableTypes
import Browse.Accept.Types as AcceptTypes
import Browse.Filter.Types
import Error.Types
import Bid.Types exposing (Bid)


type alias Model =
    { table : TableTypes.Model
    , filter : Browse.Filter.Types.Model
    , error : Error.Types.Model
    , accept : AcceptTypes.Model
    }


type Msg
    = ToTable TableTypes.Msg
    | Filter Browse.Filter.Types.Msg
    | Error Error.Types.Msg
    | ToAccept AcceptTypes.Msg
    | SetBids (List Bid)
    | UpdateBids


mapTableCmd : TableTypes.Msg -> Msg
mapTableCmd msg =
    case msg of
        TableTypes.Click bid ->
            ToAccept <| AcceptTypes.DisplayModal bid

        subMsg ->
            ToTable subMsg
